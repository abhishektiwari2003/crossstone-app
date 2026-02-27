import { prisma } from "@/lib/prisma";
import { type AppRole, canViewProject, isAdmin } from "@/lib/authz";
import { logAudit } from "@/lib/audit";
import { PaymentStatus, PaymentCategory } from "@/generated/prisma";

// -------------------------------------------------------------
// GET FINANCIAL DASHBOARD SUMMARY
// -------------------------------------------------------------
export async function getPaymentSummary(
    projectId: string,
    currentUser: { id: string; role: AppRole }
) {
    // 1. RBAC Validation: PMs, Admins, Clients allowed. Engineers rejected.
    if (currentUser.role === "SITE_ENGINEER") {
        return { error: "Site Engineers cannot view financial data", status: 403 } as const;
    }

    const allowed = await canViewProject(currentUser.id, currentUser.role, projectId);
    if (!allowed) {
        return { error: "Forbidden", status: 403 } as const;
    }

    // 2. Parallel Aggregations
    const [totalResult, paidResult, pendingResult, overdueResult] = await Promise.all([
        prisma.payment.aggregate({
            where: { projectId },
            _sum: { amount: true },
        }),
        prisma.payment.aggregate({
            where: { projectId, status: "PAID" },
            _sum: { amount: true },
        }),
        prisma.payment.aggregate({
            where: { projectId, status: "PENDING" },
            _sum: { amount: true },
        }),
        prisma.payment.aggregate({
            where: {
                projectId,
                status: "PENDING",
                dueDate: { lt: new Date() }, // strictly before today
            },
            _sum: { amount: true },
        }),
    ]);

    const totalAmount = totalResult._sum.amount?.toNumber() || 0;
    const paidAmount = paidResult._sum.amount?.toNumber() || 0;
    const pendingAmount = pendingResult._sum.amount?.toNumber() || 0;
    const overdueAmount = overdueResult._sum.amount?.toNumber() || 0;

    // 3. Compute Progress
    let paymentProgress = 0;
    if (totalAmount > 0) {
        paymentProgress = Math.round((paidAmount / totalAmount) * 100);
    }

    return {
        data: {
            totalAmount,
            paidAmount,
            pendingAmount,
            overdueAmount,
            paymentProgress,
        },
        status: 200,
    } as const;
}

// -------------------------------------------------------------
// FILTERED PAYMENTS PAGINATION
// -------------------------------------------------------------
export async function getFilteredPayments(
    projectId: string,
    filters: {
        status?: PaymentStatus;
        category?: PaymentCategory;
        from?: string;
        to?: string;
    },
    cursor: string | null = null,
    limit: number = 20,
    currentUser: { id: string; role: AppRole }
) {
    if (currentUser.role === "SITE_ENGINEER") {
        return { error: "Site Engineers cannot view financial data", status: 403 } as const;
    }

    const allowed = await canViewProject(currentUser.id, currentUser.role, projectId);
    if (!allowed) {
        return { error: "Forbidden", status: 403 } as const;
    }

    const where: any = { projectId };
    if (filters.status) where.status = filters.status;
    if (filters.category) where.category = filters.category;

    if (filters.from || filters.to) {
        where.createdAt = {};
        if (filters.from) where.createdAt.gte = new Date(filters.from);
        if (filters.to) where.createdAt.lte = new Date(filters.to);
        // Cleanup if dates were invalidly constructed
        if (isNaN(new Date(filters.from!).getTime())) delete where.createdAt.gte;
        if (isNaN(new Date(filters.to!).getTime())) delete where.createdAt.lte;
        if (Object.keys(where.createdAt).length === 0) delete where.createdAt;
    }

    const take = Math.min(limit, 100);

    const payments = await prisma.payment.findMany({
        where,
        include: { createdBy: { select: { name: true } } },
        take: take + 1,
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0,
        orderBy: { createdAt: "desc" },
    });

    const hasMore = payments.length > take;
    const items = hasMore ? payments.slice(0, take) : payments;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    // Compute real-time overdue flag
    const now = new Date();
    const resultItems = items.map((p) => ({
        id: p.id,
        amount: p.amount.toNumber(),
        currency: p.currency,
        status: p.status,
        category: p.category,
        invoiceNumber: p.invoiceNumber,
        dueDate: p.dueDate,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
        createdBy: p.createdBy.name,
        isOverdue: p.status === "PENDING" && p.dueDate && p.dueDate < now,
    }));

    return {
        data: { items: resultItems, nextCursor },
        status: 200,
    } as const;
}

// -------------------------------------------------------------
// ADMIN BULK ACTION MUTATOR
// -------------------------------------------------------------
export async function bulkUpdatePayments(
    paymentIds: string[],
    status: PaymentStatus,
    currentUser: { id: string; role: AppRole }
) {
    // 1. Strict Enforcement: Only Admins can bulk modify money
    if (!isAdmin(currentUser.role)) {
        return { error: "Only administrators can bulk modify payments", status: 403 } as const;
    }

    if (!paymentIds || paymentIds.length === 0) {
        return { error: "No payments provided", status: 400 } as const;
    }

    // 2. Validate existence and project relations
    const existing = await prisma.payment.findMany({
        where: { id: { in: paymentIds } },
        select: { id: true, projectId: true },
    });

    if (existing.length !== paymentIds.length) {
        return { error: "One or more payment IDs are invalid", status: 400 } as const;
    }

    // (Optional) Enforce single project boundary
    const projectIds = new Set(existing.map((e) => e.projectId));
    if (projectIds.size > 1) {
        return { error: "Cannot bulk update payments across multiple projects simultaneously", status: 400 } as const;
    }

    const projectId = Array.from(projectIds)[0];

    // 3. Determine time mutation
    const paidAtDate = status === "PAID" ? new Date() : null;

    // 4. Update
    const result = await prisma.payment.updateMany({
        where: { id: { in: paymentIds } },
        data: {
            status,
            paidAt: paidAtDate, // syncs the physical paid date timestamp
        },
    });

    // 5. Fire Audit Call safely
    await logAudit({
        userId: currentUser.id,
        action: "UPDATE_PAYMENT",
        entity: "Payment",
        entityId: "BULK",
        projectId,
        metadata: {
            affectedIds: paymentIds,
            newStatus: status,
            count: result.count,
        },
    });

    return {
        data: { updatedCount: result.count },
        status: 200,
    } as const;
}

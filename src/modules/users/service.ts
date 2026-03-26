import { prisma } from "@/lib/prisma";
import type { AppRole } from "@/lib/authz";

/**
 * User detail (`/users/[id]`) and profile API are restricted to super admins only.
 */
export function canViewUserProfile(currentUser: { id: string; role: AppRole }, _targetUserId: string) {
    return currentUser.role === "SUPER_ADMIN";
}

export async function getUserProfileData(userId: string) {
    // Basic User Data
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            designation: true,
            createdAt: true,
            isActive: true,
        },
    });

    if (!user) return null;

    // Parallel fetch for aggregations and lists
    const [
        projectsAssigned,
        inspectionsDone,
        updatesPosted,
        queriesCreated,
        paymentsHandled,
        auditLogs
    ] = await Promise.all([
        // Projects Assigned
        prisma.projectMember.findMany({
            where: { userId },
            include: {
                project: {
                    select: { id: true, name: true, status: true, manager: { select: { name: true } } },
                },
            },
            orderBy: { createdAt: "desc" },
        }),
        // Inspections
        prisma.inspection.findMany({
            where: { engineerId: userId },
            include: {
                project: { select: { id: true, name: true } },
                milestone: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 20,
        }),
        // Updates
        prisma.projectUpdate.findMany({
            where: { authorId: userId },
            include: {
                project: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 20,
        }),
        // Queries
        prisma.query.findMany({
            where: { authorId: userId },
            include: {
                project: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 20,
        }),
        // Payments Handled (Created)
        prisma.payment.findMany({
            where: { createdById: userId },
            include: {
                project: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 20,
        }),
        // Audit Logs for timeline
        prisma.auditLog.findMany({
            where: { userId },
            include: {
                project: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 50,
        })
    ]);

    // Construct Stats Summary
    const statsSummary = {
        totalProjects: projectsAssigned.length,
        inspectionsCompleted: await prisma.inspection.count({ where: { engineerId: userId, status: "REVIEWED" } }),
        updatesPosted: await prisma.projectUpdate.count({ where: { authorId: userId } }),
        queriesHandled: await prisma.query.count({ where: { authorId: userId } }),
        paymentsApproved: await prisma.payment.count({ where: { createdById: userId, status: "PAID" } }),
    };

    // Construct Activity Timeline via aggregation
    const activityTimeline = [...auditLogs].map(log => ({
        id: log.id,
        type: "AUDIT",
        action: log.action,
        entity: log.entity,
        createdAt: log.createdAt.toISOString(),
        project: log.project
    }));

    // We can also inject direct actions if we want heavily detailed timelines, but Audit logs usually capture everything.

    const paymentsPlain = paymentsHandled.map((p) => ({
        ...p,
        amount: p.amount.toString(),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        paidAt: p.paidAt?.toISOString() ?? null,
        dueDate: p.dueDate?.toISOString() ?? null,
    }));

    return {
        user: {
            ...user,
            createdAt: user.createdAt.toISOString()
        },
        projectsAssigned: projectsAssigned.map(p => ({ ...p, createdAt: p.createdAt.toISOString() })),
        inspectionsDone,
        updatesPosted,
        queriesCreated,
        paymentsHandled: paymentsPlain,
        activityTimeline,
        statsSummary,
    };
}

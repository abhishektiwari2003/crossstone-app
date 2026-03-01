import { prisma } from "@/lib/prisma";
import { isAdmin, type AppRole } from "@/lib/authz";
import { subMonths, format, eachMonthOfInterval } from "date-fns";

// -------------- Type Definitions --------------
type DateRange = { gte: Date; lte: Date };

export async function getAnalyticsDashboard(
    currentUserRole: AppRole,
    from?: string,
    to?: string
) {
    if (!isAdmin(currentUserRole)) {
        return { error: "Forbidden", status: 403 } as const;
    }

    // 1. Resolve date ranges
    let startDate: Date;
    let endDate: Date;

    if (from && to) {
        startDate = new Date(from);
        endDate = new Date(to);
        // fallback to defaults if parsing fails
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            endDate = new Date();
            startDate = subMonths(endDate, 6);
        }
    } else {
        endDate = new Date();
        startDate = subMonths(endDate, 6);
    }

    const dateRange: DateRange = { gte: startDate, lte: endDate };

    // 2. Fetch KPIs using Promise.all for parallelism
    const [
        totalProjects,
        activeProjects,
        totalInspections,
        revenueResult,
        projectStatusRaw,
        inspectionsRaw,
        paymentsRaw,
        engineersRaw,
        portfolioValueResult
    ] = await Promise.all([
        prisma.project.count({ where: { createdAt: dateRange } }),
        prisma.project.count({ where: { status: "IN_PROGRESS" } }),
        prisma.inspection.count({ where: { status: "SUBMITTED", createdAt: dateRange } }),
        prisma.payment.aggregate({
            _sum: { amount: true },
            where: { status: "PAID", createdAt: dateRange },
        }),
        prisma.project.groupBy({
            by: ["status"],
            _count: true,
        }),
        prisma.inspection.findMany({
            where: { createdAt: dateRange },
            select: { createdAt: true },
        }),
        prisma.payment.findMany({
            where: { createdAt: dateRange },
            select: { createdAt: true, amount: true, status: true },
        }),
        // For engineer performance, we fetch all submitted inspections with their responses
        prisma.inspection.findMany({
            where: { status: "SUBMITTED", createdAt: dateRange },
            include: {
                engineer: { select: { id: true, name: true } },
                responses: { select: { result: true } },
            },
        }),
        // Total portfolio value across all projects
        prisma.project.aggregate({
            _sum: { totalValue: true },
        }),
    ]);

    const totalRevenue = revenueResult._sum.amount?.toNumber() || 0;
    const totalPortfolioValue = portfolioValueResult._sum.totalValue || 0;

    // 3. Transform Project Status Distribution
    const projectStatusDistribution = projectStatusRaw.map((p) => ({
        status: p.status,
        count: p._count,
    }));

    // 4. Generate 0-Filled Months for Charts
    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    const initialMonthlyTrends = months.reduce((acc, month) => {
        const monthKey = format(month, "MMM"); // e.g., "Jan"
        acc[monthKey] = { month: monthKey, count: 0, paid: 0, pending: 0 };
        return acc;
    }, {} as Record<string, { month: string; count: number; paid: number; pending: number }>);

    // 5. Populate Monthly Inspections
    inspectionsRaw.forEach((insp) => {
        const m = format(insp.createdAt, "MMM");
        if (initialMonthlyTrends[m]) {
            initialMonthlyTrends[m].count += 1;
        }
    });

    // 6. Populate Payment Trends
    paymentsRaw.forEach((pay) => {
        const m = format(pay.createdAt, "MMM");
        if (initialMonthlyTrends[m]) {
            const amt = pay.amount.toNumber();
            if (pay.status === "PAID") {
                initialMonthlyTrends[m].paid += amt;
            } else {
                // Partial, pending, overdue
                initialMonthlyTrends[m].pending += amt;
            }
        }
    });

    const chartDataArray = Object.values(initialMonthlyTrends);
    const monthlyInspections = chartDataArray.map((d) => ({ month: d.month, count: d.count }));
    const paymentTrends = chartDataArray.map((d) => ({ month: d.month, paid: d.paid, pending: d.pending }));

    // 7. Compute Engineer Performance
    const engineerMap = new Map<string, { name: string; inspectionCount: number; passCount: number; totalResponses: number }>();

    engineersRaw.forEach((insp) => {
        if (!engineerMap.has(insp.engineer.id)) {
            engineerMap.set(insp.engineer.id, {
                name: insp.engineer.name,
                inspectionCount: 0,
                passCount: 0,
                totalResponses: 0,
            });
        }

        const eng = engineerMap.get(insp.engineer.id)!;
        eng.inspectionCount += 1;

        insp.responses.forEach((resp) => {
            if (resp.result !== "NA") { // Ignore N/A
                eng.totalResponses += 1;
                if (resp.result === "PASS") {
                    eng.passCount += 1;
                }
            }
        });
    });

    const engineerPerformance = Array.from(engineerMap.entries())
        .map(([engineerId, stats]) => {
            const avgPassRate = stats.totalResponses > 0
                ? Math.round((stats.passCount / stats.totalResponses) * 100)
                : 0;

            return {
                engineerId,
                name: stats.name,
                inspectionCount: stats.inspectionCount,
                avgPassRate,
            };
        })
        .sort((a, b) => b.inspectionCount - a.inspectionCount) // Descending by count
        .slice(0, 10); // Top 10

    // 8. Return final contract
    return {
        data: {
            kpis: {
                totalProjects,
                activeProjects,
                totalInspections,
                totalRevenue,
                totalPortfolioValue,
            },
            projectStatusDistribution,
            monthlyInspections,
            paymentTrends,
            engineerPerformance,
        },
        status: 200,
    } as const;
}

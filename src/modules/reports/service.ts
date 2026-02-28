import { prisma } from "@/lib/prisma";
import { canViewProject } from "@/lib/authz";
import { User } from "@/generated/prisma";
import React from "react";
import { renderToStream } from "@react-pdf/renderer";
import { ProjectReportPDF } from "./pdf/ProjectReportPDF";

export async function getProjectReport(projectId: string, currentUser: User) {
    // 1. RBAC Verification
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasAccess = await canViewProject(currentUser.id, currentUser.role as any, projectId);
    if (!hasAccess) {
        throw new Error("UNAUTHORIZED");
    }

    // 2. Project Details
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: {
            id: true,
            name: true,
            status: true,
            createdAt: true,
        },
    });

    if (!project) {
        throw new Error("NOT_FOUND");
    }

    // 3. Inspection Summary Aggregation
    const totalInspections = await prisma.inspection.count({
        where: { projectId, status: "SUBMITTED" },
    });

    const responseCounts = await prisma.inspectionResponse.groupBy({
        by: ["result"],
        where: {
            inspection: {
                projectId,
                status: "SUBMITTED",
            },
        },
        _count: {
            result: true,
        },
    });

    let passCount = 0;
    let failCount = 0;
    let naCount = 0;

    responseCounts.forEach((group) => {
        if (group.result === "PASS") passCount = group._count.result;
        if (group.result === "FAIL") failCount = group._count.result;
        if (group.result === "NA") naCount = group._count.result;
    });

    const totalResponses = passCount + failCount + naCount;
    const passRate = totalResponses > 0 ? Math.round((passCount / totalResponses) * 100) : 0;

    // 4. Payment Summary Aggregation
    const payments = await prisma.payment.groupBy({
        by: ["status"],
        where: { projectId },
        _sum: { amount: true },
    });

    let paidAmount = 0;
    let pendingAmount = 0;

    payments.forEach((group) => {
        const amount = group._sum.amount ? Number(group._sum.amount) : 0;
        if (group.status === "PAID") paidAmount += amount;
        if (group.status === "PENDING" || group.status === "PARTIAL" || group.status === "OVERDUE") {
            pendingAmount += amount;
        }
    });

    const totalAmount = paidAmount + pendingAmount;
    const paymentProgress = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

    // 5. Milestone Progress Calculation
    const totalMilestones = await prisma.milestone.count({
        where: { projectId, isActive: true },
    });

    const completedMilestonesQuery = await prisma.inspection.groupBy({
        by: ["milestoneId"],
        where: { projectId, status: "SUBMITTED" },
    });
    const completedMilestones = completedMilestonesQuery.length;

    const progressPercentage =
        totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    // 6. Timeline Aggregation (Latest 10 events)
    const latestInspections = await prisma.inspection.findMany({
        where: { projectId, status: "SUBMITTED" },
        select: {
            createdAt: true,
            milestone: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
    });

    const latestPayments = await prisma.payment.findMany({
        where: { projectId, status: "PAID" },
        select: {
            createdAt: true,
            amount: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
    });

    type TimelineEvent = { type: string; title: string; date: Date | string };
    const timeline: TimelineEvent[] = [];

    latestInspections.forEach((insp) => {
        timeline.push({
            type: "INSPECTION_SUBMITTED",
            title: `${insp.milestone.name} Inspection Submitted`,
            date: insp.createdAt,
        });
    });

    latestPayments.forEach((pay) => {
        timeline.push({
            type: "PAYMENT_RECEIVED",
            title: `₹${Number(pay.amount).toLocaleString("en-IN")} Payment Received`,
            date: pay.createdAt,
        });
    });

    // Sort timeline descending by date and take latest 10
    timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const finalTimeline = timeline.slice(0, 10).map((event) => ({
        ...event,
        date: new Date(event.date).toISOString(),
    }));

    return {
        project: {
            id: project.id,
            name: project.name,
            status: project.status,
            startDate: project.createdAt.toISOString(),
            endDate: null,
        },
        inspectionSummary: {
            totalInspections,
            passCount,
            failCount,
            naCount,
            passRate,
        },
        paymentSummary: {
            totalAmount,
            paidAmount,
            pendingAmount,
            paymentProgress,
        },
        milestoneProgress: {
            totalMilestones,
            completedMilestones,
            progressPercentage,
        },
        timeline: finalTimeline,
    };
}

export async function generateProjectReportPDF(projectId: string, currentUser: User) {
    // Re-uses getProjectReport which also enforces RBAC
    const reportData = await getProjectReport(projectId, currentUser);

    // Generate PDF stream
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfStream = await renderToStream(React.createElement(ProjectReportPDF, { data: reportData }) as any);
    return pdfStream;
}

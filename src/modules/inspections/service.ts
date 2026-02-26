import { prisma } from "@/lib/prisma";
import { isAdmin, type AppRole } from "@/lib/authz";
import type { CreateInspectionInput } from "./validation";
import type { ChecklistResult, InspectionStatus } from "@/generated/prisma";

// ─── Full include for inspection detail ───
const inspectionDetailInclude = {
    milestone: { select: { id: true, name: true, order: true } },
    engineer: { select: { id: true, name: true, email: true } },
    reviewedBy: { select: { id: true, name: true, email: true } },
    responses: {
        include: {
            checklistItem: {
                select: { id: true, title: true, description: true, order: true, isRequired: true, isPhotoRequired: true },
            },
            media: {
                select: { id: true, fileKey: true, fileUrl: true, mimeType: true },
            },
        },
    },
} as const;

// ─── Create an inspection (with transaction) ───
export async function createInspection(
    data: CreateInspectionInput,
    currentUser: { id: string; role: AppRole }
) {
    const { projectId, milestoneId, status: requestedStatus, responses } = data;
    const targetStatus = requestedStatus || "DRAFT";

    // 1. Verify engineer is a member of the project
    const membership = await prisma.projectMember.findFirst({
        where: { projectId, userId: currentUser.id },
    });
    if (!membership) {
        return { error: "You are not assigned to this project", status: 403 } as const;
    }

    // 2. Verify milestone belongs to the project and is active
    const milestone = await prisma.milestone.findUnique({
        where: { id: milestoneId },
        include: { checklistItems: true },
    });
    if (!milestone || milestone.projectId !== projectId) {
        return { error: "Milestone not found in this project", status: 404 } as const;
    }
    if (!milestone.isActive) {
        return { error: "Milestone is inactive", status: 400 } as const;
    }

    // 3. Check for existing SUBMITTED inspection for this milestone+engineer
    if (targetStatus === "SUBMITTED") {
        const existingSubmitted = await prisma.inspection.findFirst({
            where: { milestoneId, engineerId: currentUser.id, status: "SUBMITTED" },
        });
        if (existingSubmitted) {
            return { error: "You already have a submitted inspection for this milestone", status: 409 } as const;
        }
    }

    // 4. Validate submission requirements if SUBMITTED
    if (targetStatus === "SUBMITTED") {
        const validationError = validateSubmission(milestone.checklistItems, responses);
        if (validationError) {
            return { error: validationError, status: 400 } as const;
        }
    }

    // 5. Validate media types if any mediaId provided
    const mediaIds = responses.filter(r => r.mediaId).map(r => r.mediaId!);
    if (mediaIds.length > 0) {
        const mediaRecords = await prisma.media.findMany({
            where: { id: { in: mediaIds } },
            select: { id: true, type: true },
        });
        const invalidMedia = mediaRecords.filter(m => m.type !== "INSPECTION_IMAGE");
        if (invalidMedia.length > 0) {
            return { error: "All media must be of type INSPECTION_IMAGE", status: 400 } as const;
        }
        if (mediaRecords.length !== mediaIds.length) {
            return { error: "One or more media records not found", status: 404 } as const;
        }
    }

    // 6. Transaction: create inspection + bulk create responses
    const inspection = await prisma.$transaction(async (tx) => {
        const created = await tx.inspection.create({
            data: {
                projectId,
                milestoneId,
                engineerId: currentUser.id,
                status: targetStatus as InspectionStatus,
            },
        });

        await tx.inspectionResponse.createMany({
            data: responses.map((r) => ({
                inspectionId: created.id,
                checklistItemId: r.checklistItemId,
                result: r.result as ChecklistResult,
                remark: r.remark ?? null,
                mediaId: r.mediaId ?? null,
            })),
        });

        return tx.inspection.findUniqueOrThrow({
            where: { id: created.id },
            include: inspectionDetailInclude,
        });
    });

    return { inspection, status: 201 } as const;
}

// ─── Validate that all required checklist items are answered ───
function validateSubmission(
    checklistItems: { id: string; isRequired: boolean; isPhotoRequired: boolean }[],
    responses: { checklistItemId: string; mediaId?: string }[]
): string | null {
    const responseMap = new Map(responses.map(r => [r.checklistItemId, r]));

    for (const item of checklistItems) {
        if (item.isRequired) {
            const response = responseMap.get(item.id);
            if (!response) {
                return `Missing required response for checklist item ${item.id}`;
            }
        }
        if (item.isPhotoRequired) {
            const response = responseMap.get(item.id);
            if (!response?.mediaId) {
                return `Photo required for checklist item ${item.id}`;
            }
        }
    }

    return null;
}

// ─── Get inspection by ID ───
export async function getInspectionById(
    inspectionId: string,
    currentUser: { id: string; role: AppRole }
) {
    const inspection = await prisma.inspection.findUnique({
        where: { id: inspectionId },
        include: inspectionDetailInclude,
    });

    if (!inspection) {
        return { error: "Inspection not found", status: 404 } as const;
    }

    // RBAC: engineer can only see own, client can only see SUBMITTED/REVIEWED
    if (currentUser.role === "SITE_ENGINEER" && inspection.engineerId !== currentUser.id) {
        return { error: "Forbidden", status: 403 } as const;
    }
    if (currentUser.role === "CLIENT" && inspection.status === "DRAFT") {
        return { error: "Forbidden", status: 403 } as const;
    }

    return { inspection, status: 200 } as const;
}

// ─── Get inspections for a project (RBAC filtered) ───
export async function getProjectInspections(
    projectId: string,
    currentUser: { id: string; role: AppRole }
) {
    let where: Record<string, unknown> = { projectId };

    if (currentUser.role === "SITE_ENGINEER") {
        // Engineer only sees own inspections
        where = { ...where, engineerId: currentUser.id };
    } else if (currentUser.role === "CLIENT") {
        // Client only sees SUBMITTED and REVIEWED
        where = { ...where, status: { in: ["SUBMITTED", "REVIEWED"] } };
    }
    // Admin/PM see all

    const inspections = await prisma.inspection.findMany({
        where,
        include: inspectionDetailInclude,
        orderBy: { createdAt: "desc" },
    });

    return inspections;
}

// ─── Review an inspection (ADMIN/PM only) ───
export async function reviewInspection(
    inspectionId: string,
    currentUser: { id: string; role: AppRole }
) {
    // Only Admin or PM can review
    if (!isAdmin(currentUser.role) && currentUser.role !== "PROJECT_MANAGER") {
        return { error: "Forbidden", status: 403 } as const;
    }

    const inspection = await prisma.inspection.findUnique({
        where: { id: inspectionId },
    });

    if (!inspection) {
        return { error: "Inspection not found", status: 404 } as const;
    }

    // Can only review SUBMITTED inspections
    if (inspection.status !== "SUBMITTED") {
        return { error: "Only submitted inspections can be reviewed", status: 400 } as const;
    }

    const updated = await prisma.inspection.update({
        where: { id: inspectionId },
        data: {
            status: "REVIEWED",
            reviewedById: currentUser.id,
        },
        include: inspectionDetailInclude,
    });

    return { inspection: updated, status: 200 } as const;
}

// ─── Mobile DTO mapper for inspections ───
function mapInspectionToMobileDTO(inspection: {
    id: string;
    status: string;
    createdAt: Date;
    milestone: { name: string };
    responses: { result: string }[];
}) {
    const resultSummary = { pass: 0, fail: 0, na: 0 };
    for (const r of inspection.responses) {
        if (r.result === "PASS") resultSummary.pass++;
        else if (r.result === "FAIL") resultSummary.fail++;
        else resultSummary.na++;
    }

    return {
        id: inspection.id,
        milestoneName: inspection.milestone.name,
        status: inspection.status,
        submittedAt: inspection.createdAt,
        resultSummary,
    };
}

// ─── Cursor-paginated inspections for mobile ───
export async function getPaginatedProjectInspections(
    projectId: string,
    currentUser: { id: string; role: AppRole },
    cursor?: string | null,
    limit: number = 10
) {
    const take = Math.min(limit, 50);

    let where: Record<string, unknown> = { projectId };
    if (currentUser.role === "SITE_ENGINEER") {
        where = { ...where, engineerId: currentUser.id };
    } else if (currentUser.role === "CLIENT") {
        where = { ...where, status: { in: ["SUBMITTED", "REVIEWED"] } };
    }

    const inspections = await prisma.inspection.findMany({
        where,
        select: {
            id: true,
            status: true,
            createdAt: true,
            milestone: { select: { name: true } },
            responses: { select: { result: true } },
        },
        take: take + 1,
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0,
        orderBy: { createdAt: "desc" },
    });

    const hasMore = inspections.length > take;
    const items = hasMore ? inspections.slice(0, take) : inspections;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return {
        items: items.map(mapInspectionToMobileDTO),
        nextCursor,
    };
}


import { prisma } from "@/lib/prisma";
import { isAdmin, type AppRole } from "@/lib/authz";
import type { CreateMilestoneInput, UpdateMilestoneInput, CreateChecklistInput, UpdateChecklistInput } from "./validation";

// ─── Create a milestone for a project ───
export async function createMilestone(
    projectId: string,
    data: CreateMilestoneInput,
    currentUser: { id: string; role: AppRole }
) {
    if (!isAdmin(currentUser.role)) {
        return { error: "Forbidden", status: 403 } as const;
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
        return { error: "Project not found", status: 404 } as const;
    }

    const milestone = await prisma.milestone.create({
        data: { ...data, projectId },
        include: { checklistItems: { orderBy: { order: "asc" } } },
    });

    return { milestone, status: 201 } as const;
}

// ─── Get all milestones for a project ───
export async function getProjectMilestones(projectId: string) {
    return prisma.milestone.findMany({
        where: { projectId },
        orderBy: { order: "asc" },
        include: {
            checklistItems: { orderBy: { order: "asc" } },
        },
    });
}

// ─── Update a milestone ───
export async function updateMilestone(
    milestoneId: string,
    data: UpdateMilestoneInput,
    currentUser: { id: string; role: AppRole }
) {
    if (!isAdmin(currentUser.role)) {
        return { error: "Forbidden", status: 403 } as const;
    }

    const existing = await prisma.milestone.findUnique({ where: { id: milestoneId } });
    if (!existing) {
        return { error: "Milestone not found", status: 404 } as const;
    }

    const milestone = await prisma.milestone.update({
        where: { id: milestoneId },
        data,
        include: { checklistItems: { orderBy: { order: "asc" } } },
    });

    return { milestone, status: 200 } as const;
}

// ─── Delete a milestone (cascade deletes checklist items + inspections) ───
export async function deleteMilestone(
    milestoneId: string,
    currentUser: { id: string; role: AppRole }
) {
    if (!isAdmin(currentUser.role)) {
        return { error: "Forbidden", status: 403 } as const;
    }

    const existing = await prisma.milestone.findUnique({ where: { id: milestoneId } });
    if (!existing) {
        return { error: "Milestone not found", status: 404 } as const;
    }

    // Delete in order: responses → inspections → checklist items → milestone
    await prisma.$transaction([
        prisma.inspectionResponse.deleteMany({
            where: { inspection: { milestoneId } },
        }),
        prisma.inspection.deleteMany({ where: { milestoneId } }),
        prisma.checklistItem.deleteMany({ where: { milestoneId } }),
        prisma.milestone.delete({ where: { id: milestoneId } }),
    ]);

    return { message: "Milestone deleted successfully", status: 200 } as const;
}

// ─── Create a checklist item for a milestone ───
export async function createChecklistItem(
    milestoneId: string,
    data: CreateChecklistInput,
    currentUser: { id: string; role: AppRole }
) {
    if (!isAdmin(currentUser.role)) {
        return { error: "Forbidden", status: 403 } as const;
    }

    const milestone = await prisma.milestone.findUnique({ where: { id: milestoneId } });
    if (!milestone) {
        return { error: "Milestone not found", status: 404 } as const;
    }

    const item = await prisma.checklistItem.create({
        data: { ...data, milestoneId },
    });

    return { checklistItem: item, status: 201 } as const;
}

// ─── Update a checklist item ───
export async function updateChecklistItem(
    itemId: string,
    data: UpdateChecklistInput,
    currentUser: { id: string; role: AppRole }
) {
    if (!isAdmin(currentUser.role)) {
        return { error: "Forbidden", status: 403 } as const;
    }

    const existing = await prisma.checklistItem.findUnique({ where: { id: itemId } });
    if (!existing) {
        return { error: "Checklist item not found", status: 404 } as const;
    }

    const item = await prisma.checklistItem.update({
        where: { id: itemId },
        data,
    });

    return { checklistItem: item, status: 200 } as const;
}

// ─── Delete a checklist item ───
export async function deleteChecklistItem(
    itemId: string,
    currentUser: { id: string; role: AppRole }
) {
    if (!isAdmin(currentUser.role)) {
        return { error: "Forbidden", status: 403 } as const;
    }

    const existing = await prisma.checklistItem.findUnique({ where: { id: itemId } });
    if (!existing) {
        return { error: "Checklist item not found", status: 404 } as const;
    }

    await prisma.checklistItem.delete({ where: { id: itemId } });

    return { message: "Checklist item deleted successfully", status: 200 } as const;
}

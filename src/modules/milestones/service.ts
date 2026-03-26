import { prisma } from "@/lib/prisma";
import { canManageProjectMilestones, type AppRole } from "@/lib/authz";
import type { CreateMilestoneInput, UpdateMilestoneInput, CreateChecklistInput, UpdateChecklistInput } from "./validation";

async function assertCanManageProject(
    projectId: string,
    currentUser: { id: string; role: AppRole }
): Promise<{ ok: true } | { error: string; status: number }> {
    const allowed = await canManageProjectMilestones(currentUser.id, currentUser.role, projectId);
    if (!allowed) return { error: "Forbidden", status: 403 };
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return { error: "Project not found", status: 404 };
    return { ok: true };
}

// ─── Create a milestone for a project ───
export async function createMilestone(
    projectId: string,
    data: CreateMilestoneInput,
    currentUser: { id: string; role: AppRole }
) {
    const gate = await assertCanManageProject(projectId, currentUser);
    if ("error" in gate) return gate;

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
    const existing = await prisma.milestone.findUnique({ where: { id: milestoneId } });
    if (!existing) {
        return { error: "Milestone not found", status: 404 } as const;
    }

    const gate = await assertCanManageProject(existing.projectId, currentUser);
    if ("error" in gate) return gate;

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
    const existing = await prisma.milestone.findUnique({ where: { id: milestoneId } });
    if (!existing) {
        return { error: "Milestone not found", status: 404 } as const;
    }

    const gate = await assertCanManageProject(existing.projectId, currentUser);
    if ("error" in gate) return gate;

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
    const milestone = await prisma.milestone.findUnique({ where: { id: milestoneId } });
    if (!milestone) {
        return { error: "Milestone not found", status: 404 } as const;
    }

    const gate = await assertCanManageProject(milestone.projectId, currentUser);
    if ("error" in gate) return gate;

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
    const existing = await prisma.checklistItem.findUnique({
        where: { id: itemId },
        include: { milestone: { select: { projectId: true } } },
    });
    if (!existing) {
        return { error: "Checklist item not found", status: 404 } as const;
    }

    const gate = await assertCanManageProject(existing.milestone.projectId, currentUser);
    if ("error" in gate) return gate;

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
    const existing = await prisma.checklistItem.findUnique({
        where: { id: itemId },
        include: { milestone: { select: { projectId: true } } },
    });
    if (!existing) {
        return { error: "Checklist item not found", status: 404 } as const;
    }

    const gate = await assertCanManageProject(existing.milestone.projectId, currentUser);
    if ("error" in gate) return gate;

    await prisma.checklistItem.delete({ where: { id: itemId } });

    return { message: "Checklist item deleted successfully", status: 200 } as const;
}

export type CsvImportRowError = { line: number; message: string };

export type CsvImportResult =
    | { ok: true; milestonesCreated: number; checklistItemsCreated: number; errors: CsvImportRowError[] }
    | { error: string; status: number };

/**
 * CSV columns: milestone_name,milestone_order,checklist_title,checklist_order,is_required,is_photo_required
 * Rows with the same milestone_name belong to one milestone (first row wins order/description).
 */
export async function importMilestonesFromCsv(
    projectId: string,
    csvText: string,
    currentUser: { id: string; role: AppRole }
): Promise<CsvImportResult> {
    const gate = await assertCanManageProject(projectId, currentUser);
    if ("error" in gate) return gate;

    const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) {
        return { error: "CSV must include a header row and at least one data row", status: 400 };
    }

    const header = lines[0].toLowerCase().split(",").map((c) => c.trim());
    const expected = [
        "milestone_name",
        "milestone_order",
        "checklist_title",
        "checklist_order",
        "is_required",
        "is_photo_required",
    ];
    const norm = (s: string) => s.replace(/\s+/g, "_").toLowerCase();
    const headerNorm = header.map(norm);
    if (expected.some((e, i) => headerNorm[i] !== e)) {
        return {
            error: `Invalid header. Expected: ${expected.join(",")}`,
            status: 400,
        };
    }

    type Row = {
        milestoneName: string;
        milestoneOrder: number;
        checklistTitle: string;
        checklistOrder: number;
        isRequired: boolean;
        isPhotoRequired: boolean;
        line: number;
    };

    const rows: Row[] = [];
    const errors: CsvImportRowError[] = [];

    for (let i = 1; i < lines.length; i++) {
        const lineNo = i + 1;
        const parts = lines[i].split(",").map((c) => c.trim());
        if (parts.length < 6) {
            errors.push({ line: lineNo, message: "Expected 6 columns" });
            continue;
        }
        const [mName, mOrd, cTitle, cOrd, req, photo] = parts;
        if (!mName || !cTitle) {
            errors.push({ line: lineNo, message: "milestone_name and checklist_title are required" });
            continue;
        }
        const mo = parseInt(mOrd, 10);
        const co = parseInt(cOrd, 10);
        if (Number.isNaN(mo) || Number.isNaN(co)) {
            errors.push({ line: lineNo, message: "milestone_order and checklist_order must be integers" });
            continue;
        }
        const isReq = ["true", "1", "yes"].includes(req.toLowerCase());
        const isPhoto = ["true", "1", "yes"].includes(photo.toLowerCase());
        rows.push({
            milestoneName: mName,
            milestoneOrder: mo,
            checklistTitle: cTitle,
            checklistOrder: co,
            isRequired: isReq,
            isPhotoRequired: isPhoto,
            line: lineNo,
        });
    }

    if (rows.length === 0 && errors.length > 0) {
        return { error: "No valid rows to import", status: 400 };
    }

    const milestoneByName = new Map<
        string,
        { order: number; milestoneId?: string }
    >();

    let milestonesCreated = 0;
    let checklistItemsCreated = 0;

    await prisma.$transaction(async (tx) => {
        const existing = await tx.milestone.findMany({
            where: { projectId },
            select: { id: true, name: true, order: true },
        });
        const nameToExisting = new Map(existing.map((m) => [m.name, m]));

        for (const r of rows) {
            let milestoneId = milestoneByName.get(r.milestoneName)?.milestoneId;
            if (!milestoneId) {
                const ex = nameToExisting.get(r.milestoneName);
                if (ex) {
                    milestoneId = ex.id;
                    milestoneByName.set(r.milestoneName, { order: ex.order, milestoneId });
                } else {
                    const created = await tx.milestone.create({
                        data: {
                            projectId,
                            name: r.milestoneName,
                            order: r.milestoneOrder,
                            isActive: true,
                        },
                    });
                    milestoneId = created.id;
                    milestonesCreated++;
                    milestoneByName.set(r.milestoneName, {
                        order: r.milestoneOrder,
                        milestoneId,
                    });
                    nameToExisting.set(r.milestoneName, {
                        id: created.id,
                        name: r.milestoneName,
                        order: r.milestoneOrder,
                    });
                }
            }

            await tx.checklistItem.create({
                data: {
                    milestoneId: milestoneId!,
                    title: r.checklistTitle,
                    order: r.checklistOrder,
                    isRequired: r.isRequired,
                    isPhotoRequired: r.isPhotoRequired,
                },
            });
            checklistItemsCreated++;
        }
    });

    return { ok: true, milestonesCreated, checklistItemsCreated, errors };
}

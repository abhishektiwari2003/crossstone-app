import { prisma } from "@/lib/prisma";
import { type AppRole, canViewProject, canManageMaterials } from "@/lib/authz";
import { logAudit } from "@/lib/audit";
import type { MaterialStatus } from "@/types/materials";
import { CreateMaterialSchema, UpdateMaterialSchema } from "./validation";

// -------------------------------------------------------------
// CREATE MATERIAL
// -------------------------------------------------------------
export async function createMaterial(
    projectId: string,
    body: unknown,
    currentUser: { id: string; role: AppRole }
) {
    // 1. RBAC
    if (!canManageMaterials(currentUser.role)) {
        return { error: "Only Project Managers and Admins can add materials", status: 403 } as const;
    }

    const hasAccess = await canViewProject(currentUser.id, currentUser.role, projectId);
    if (!hasAccess) {
        return { error: "Forbidden", status: 403 } as const;
    }

    // 2. Validate body
    const parsed = CreateMaterialSchema.safeParse(body);
    if (!parsed.success) {
        return { error: parsed.error.issues[0].message, status: 400 } as const;
    }

    const { name, quantity, unit, unitCost, supplier, status } = parsed.data;

    // 3. Compute totalCost server-side
    const totalCost = quantity * unitCost;

    // 4. Create record
    const material = await prisma.material.create({
        data: {
            projectId,
            name,
            quantity,
            unit,
            unitCost,
            totalCost,
            supplier,
            status,
            createdById: currentUser.id,
        },
    });

    // 5. Audit
    await logAudit({
        userId: currentUser.id,
        action: "CREATE_MATERIAL",
        entity: "Material",
        entityId: material.id,
        projectId,
        metadata: { name, quantity, unit, unitCost, totalCost, status },
    });

    return { data: material, status: 201 } as const;
}

// -------------------------------------------------------------
// GET PROJECT MATERIALS (PAGINATED)
// -------------------------------------------------------------
export async function getProjectMaterials(
    projectId: string,
    filters: { status?: MaterialStatus },
    cursor: string | null = null,
    limit: number = 20,
    currentUser: { id: string; role: AppRole }
) {
    const hasAccess = await canViewProject(currentUser.id, currentUser.role, projectId);
    if (!hasAccess) {
        return { error: "Forbidden", status: 403 } as const;
    }

    const take = Math.min(limit, 100);

    const where: { projectId: string; status?: MaterialStatus } = { projectId };
    if (filters.status) where.status = filters.status;

    const materials = await prisma.material.findMany({
        where,
        include: { createdBy: { select: { name: true } } },
        take: take + 1,
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0,
        orderBy: { createdAt: "desc" },
    });

    const hasMore = materials.length > take;
    const items = hasMore ? materials.slice(0, take) : materials;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    const resultItems = items.map((m) => ({
        id: m.id,
        name: m.name,
        quantity: m.quantity,
        unit: m.unit,
        unitCost: m.unitCost,
        totalCost: m.totalCost,
        supplier: m.supplier,
        status: m.status,
        createdBy: m.createdBy.name,
        createdAt: m.createdAt,
    }));

    return {
        data: { items: resultItems, nextCursor },
        status: 200,
    } as const;
}

// -------------------------------------------------------------
// UPDATE MATERIAL
// -------------------------------------------------------------
export async function updateMaterial(
    materialId: string,
    body: unknown,
    currentUser: { id: string; role: AppRole }
) {
    // 1. RBAC
    if (!canManageMaterials(currentUser.role)) {
        return { error: "Only Project Managers and Admins can update materials", status: 403 } as const;
    }

    // 2. Validate body
    const parsed = UpdateMaterialSchema.safeParse(body);
    if (!parsed.success) {
        return { error: parsed.error.issues[0].message, status: 400 } as const;
    }

    // 3. Find existing material
    const existing = await prisma.material.findUnique({
        where: { id: materialId },
        select: { id: true, projectId: true, quantity: true, unitCost: true },
    });

    if (!existing) {
        return { error: "Material not found", status: 404 } as const;
    }

    // 4. Check project access
    const hasAccess = await canViewProject(currentUser.id, currentUser.role, existing.projectId);
    if (!hasAccess) {
        return { error: "Forbidden", status: 403 } as const;
    }

    // 5. Build update data and recompute totalCost if needed
    const updateData: Record<string, unknown> = {};
    const { quantity, unitCost, supplier, status } = parsed.data;

    const finalQuantity = quantity !== undefined ? quantity : existing.quantity;
    const finalUnitCost = unitCost !== undefined ? unitCost : existing.unitCost;

    if (quantity !== undefined) updateData.quantity = quantity;
    if (unitCost !== undefined) updateData.unitCost = unitCost;
    if (supplier !== undefined) updateData.supplier = supplier;
    if (status !== undefined) updateData.status = status;

    // Always recompute totalCost when quantity or unitCost changes
    if (quantity !== undefined || unitCost !== undefined) {
        updateData.totalCost = finalQuantity * finalUnitCost;
    }

    if (Object.keys(updateData).length === 0) {
        return { error: "No fields to update", status: 400 } as const;
    }

    const updated = await prisma.material.update({
        where: { id: materialId },
        data: updateData,
    });

    // 6. Audit
    await logAudit({
        userId: currentUser.id,
        action: "UPDATE_MATERIAL",
        entity: "Material",
        entityId: materialId,
        projectId: existing.projectId,
        metadata: updateData,
    });

    return { data: updated, status: 200 } as const;
}

// -------------------------------------------------------------
// DELETE MATERIAL
// -------------------------------------------------------------
export async function deleteMaterial(
    materialId: string,
    currentUser: { id: string; role: AppRole }
) {
    // 1. RBAC
    if (!canManageMaterials(currentUser.role)) {
        return { error: "Only Project Managers and Admins can delete materials", status: 403 } as const;
    }

    // 2. Find existing
    const existing = await prisma.material.findUnique({
        where: { id: materialId },
        select: { id: true, projectId: true, name: true },
    });

    if (!existing) {
        return { error: "Material not found", status: 404 } as const;
    }

    // 3. Check project access
    const hasAccess = await canViewProject(currentUser.id, currentUser.role, existing.projectId);
    if (!hasAccess) {
        return { error: "Forbidden", status: 403 } as const;
    }

    // 4. Hard delete
    await prisma.material.delete({ where: { id: materialId } });

    // 5. Audit
    await logAudit({
        userId: currentUser.id,
        action: "DELETE_MATERIAL",
        entity: "Material",
        entityId: materialId,
        projectId: existing.projectId,
        metadata: { name: existing.name },
    });

    return { data: { deleted: true }, status: 200 } as const;
}

// -------------------------------------------------------------
// MATERIAL SUMMARY (AGGREGATIONS)
// -------------------------------------------------------------
export async function getMaterialSummary(
    projectId: string,
    currentUser: { id: string; role: AppRole }
) {
    const hasAccess = await canViewProject(currentUser.id, currentUser.role, projectId);
    if (!hasAccess) {
        return { error: "Forbidden", status: 403 } as const;
    }

    // Parallel aggregations
    const [totalAgg, countAgg, costByStatusAgg] = await Promise.all([
        prisma.material.aggregate({
            where: { projectId },
            _sum: { totalCost: true },
            _count: true,
        }),
        prisma.material.groupBy({
            by: ["status"],
            where: { projectId },
            _count: true,
        }),
        prisma.material.groupBy({
            by: ["status"],
            where: { projectId },
            _sum: { totalCost: true },
        }),
    ]);

    // Merge count and cost by status
    const statusBreakdown = countAgg.map((countItem) => {
        const costItem = costByStatusAgg.find((c: any) => c.status === countItem.status);
        return {
            status: countItem.status,
            count: countItem._count,
            totalCost: costItem?._sum?.totalCost || 0,
        };
    });

    return {
        data: {
            totalCost: totalAgg._sum.totalCost || 0,
            totalItems: totalAgg._count,
            statusBreakdown,
        },
        status: 200,
    } as const;
}

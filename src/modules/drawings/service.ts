import { prisma } from "@/lib/prisma";
import { isAdmin, canViewProject, type AppRole } from "@/lib/authz";
import { logAudit } from "@/lib/audit";

// ─── Create a drawing (ADMIN only) ───
export async function createDrawing(
    projectId: string,
    data: { url: string; version: number },
    currentUser: { id: string; role: AppRole }
) {
    if (!isAdmin(currentUser.role)) {
        return { error: "Forbidden", status: 403 } as const;
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
        return { error: "Project not found", status: 404 } as const;
    }

    if (!Number.isInteger(data.version) || data.version < 1) {
        return { error: "Version must be a positive integer", status: 400 } as const;
    }

    const drawing = await prisma.media.create({
        data: {
            projectId,
            type: "DRAWING",
            fileKey: data.url,
            fileUrl: data.url,
            mimeType: "application/pdf",
            fileSize: 0,
            createdById: currentUser.id,
            version: data.version,
        },
        include: {
            createdBy: {
                select: { id: true, name: true },
            },
        },
    });

    await logAudit({
        userId: currentUser.id,
        action: "UPLOAD_DRAWING",
        entity: "Media",
        entityId: drawing.id,
        projectId,
        metadata: {
            version: data.version,
            url: data.url,
        },
    });

    return {
        drawing: {
            id: drawing.id,
            url: drawing.fileUrl,
            version: drawing.version,
            approvedAt: drawing.approvedAt,
            approvedBy: drawing.approvedBy,
            createdAt: drawing.createdAt,
            uploadedBy: drawing.createdBy,
        },
        status: 201,
    } as const;
}

// ─── List drawings for a project (RBAC via canViewProject) ───
export async function listProjectDrawings(
    projectId: string,
    currentUser: { id: string; role: AppRole }
) {
    // RBAC check
    const allowed = await canViewProject(currentUser.id, currentUser.role, projectId);
    if (!allowed) {
        return { error: "Forbidden", status: 403 } as const;
    }

    const drawings = await prisma.media.findMany({
        where: { projectId, type: "DRAWING" },
        orderBy: { version: "desc" },
        include: {
            createdBy: {
                select: { id: true, name: true },
            },
        },
    });

    return {
        drawings: drawings.map((d) => ({
            id: d.id,
            url: d.fileUrl,
            version: d.version,
            approvedAt: d.approvedAt,
            approvedBy: d.approvedBy,
            createdAt: d.createdAt,
            uploadedBy: d.createdBy,
        })),
        status: 200,
    } as const;
}

// ─── Approve a drawing (ADMIN only) ───
export async function approveDrawing(
    drawingId: string,
    currentUser: { id: string; role: AppRole }
) {
    if (!isAdmin(currentUser.role)) {
        return { error: "Forbidden", status: 403 } as const;
    }

    const media = await prisma.media.findUnique({ where: { id: drawingId } });
    if (!media) {
        return { error: "Drawing not found", status: 404 } as const;
    }

    if (media.type !== "DRAWING") {
        return { error: "Media is not a drawing", status: 400 } as const;
    }

    if (media.approvedAt) {
        return { error: "Drawing is already approved", status: 400 } as const;
    }

    const updated = await prisma.media.update({
        where: { id: drawingId },
        data: {
            approvedBy: currentUser.id,
            approvedAt: new Date(),
        },
        include: {
            createdBy: {
                select: { id: true, name: true },
            },
        },
    });

    await logAudit({
        userId: currentUser.id,
        action: "APPROVE_DRAWING",
        entity: "Media",
        entityId: drawingId,
        projectId: media.projectId,
        metadata: {
            version: media.version,
        },
    });

    return {
        drawing: {
            id: updated.id,
            url: updated.fileUrl,
            version: updated.version,
            approvedAt: updated.approvedAt,
            approvedBy: updated.approvedBy,
            createdAt: updated.createdAt,
            uploadedBy: updated.createdBy,
        },
        status: 200,
    } as const;
}

// ─── Cursor-paginated drawings for mobile ───
export async function getPaginatedDrawings(
    projectId: string,
    currentUser: { id: string; role: AppRole },
    cursor?: string | null,
    limit: number = 10
) {
    const allowed = await canViewProject(currentUser.id, currentUser.role, projectId);
    if (!allowed) {
        return { error: "Forbidden", status: 403 } as const;
    }

    const take = Math.min(limit, 50);

    const drawings = await prisma.media.findMany({
        where: { projectId, type: "DRAWING" },
        select: {
            id: true,
            fileUrl: true,
            version: true,
            approvedAt: true,
            approvedBy: true,
            createdAt: true,
        },
        take: take + 1,
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0,
        orderBy: { version: "desc" },
    });

    const hasMore = drawings.length > take;
    const items = hasMore ? drawings.slice(0, take) : drawings;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return {
        items: items.map((d) => ({
            id: d.id,
            url: d.fileUrl,
            version: d.version,
            isApproved: d.approvedAt !== null,
            approvedAt: d.approvedAt,
            createdAt: d.createdAt,
        })),
        nextCursor,
        status: 200,
    } as const;
}


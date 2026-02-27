import { prisma } from "@/lib/prisma";
import { isAdmin, canViewProject, type AppRole } from "@/lib/authz";

// ─── Map actions to human-readable titles & descriptions ───
const AUDIT_ACTION_MAP: Record<string, { title: string; desc: (entityId: string) => string }> = {
    CREATE_PROJECT: { title: "Project created", desc: () => "A new project was created in the system" },
    UPDATE_PROJECT: { title: "Project updated", desc: () => "Project details were updated" },
    ADD_MEMBER: { title: "Member assigned", desc: () => "A new member was added to the project" },
    REMOVE_MEMBER: { title: "Member removed", desc: () => "A member was removed from the project" },
    CREATED_INSPECTION: { title: "Inspection drafted", desc: (id) => `Draft inspection created (${id})` },
    SUBMITTED_INSPECTION: { title: "Inspection submitted", desc: () => "An inspection was submitted for review" },
    REVIEWED_INSPECTION: { title: "Inspection reviewed", desc: () => "An inspection was reviewed by a PM/Admin" },
    UPLOAD_DRAWING: { title: "Drawing uploaded", desc: () => "A new drawing revision was uploaded" },
    APPROVE_DRAWING: { title: "Drawing approved", desc: () => "A drawing version was approved" },
    CREATE_QUERY: { title: "Issue raised", desc: () => "A new project query/issue was created" },
    UPDATE_QUERY: { title: "Issue updated", desc: () => "The status or priority of an issue was changed" },
    ADD_QUERY_RESPONSE: { title: "Reply added", desc: () => "A response was added to an issue" },
};

// ─── API: Get Admin Audit Logs ───
export async function getAuditLogs(
    currentUserRole: AppRole,
    filters: { projectId?: string; userId?: string; action?: string; from?: string; to?: string },
    cursor?: string | null,
    limit: number = 20
) {
    if (!isAdmin(currentUserRole)) {
        return { error: "Forbidden", status: 403 } as const;
    }

    const take = Math.min(limit, 100);

    let where: Record<string, unknown> = {};
    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = filters.action;
    if (filters.from || filters.to) {
        where.createdAt = {
            ...(filters.from ? { gte: new Date(filters.from) } : {}),
            ...(filters.to ? { lte: new Date(filters.to) } : {}),
        };
    }

    const logs = await prisma.auditLog.findMany({
        where,
        include: {
            user: { select: { name: true } },
        },
        take: take + 1,
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0,
        orderBy: { createdAt: "desc" },
    });

    const hasMore = logs.length > take;
    const items = hasMore ? logs.slice(0, take) : logs;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return {
        items: items.map((log) => ({
            id: log.id,
            userName: log.user.name,
            action: log.action,
            entity: log.entity,
            entityId: log.entityId,
            createdAt: log.createdAt,
            metadata: log.metadata,
        })),
        nextCursor,
        status: 200,
    } as const;
}

// ─── API: Get Project Activity Timeline ───
export async function getProjectTimeline(
    projectId: string,
    currentUser: { id: string; role: AppRole }
) {
    // 1. RBAC Check (Project Members & Admins)
    const allowed = await canViewProject(currentUser.id, currentUser.role, projectId);
    if (!allowed) {
        return { error: "Forbidden", status: 403 } as const;
    }

    const logs = await prisma.auditLog.findMany({
        where: { projectId },
        include: {
            user: { select: { name: true } },
        },
        take: 20,
        orderBy: { createdAt: "desc" },
    });

    return {
        items: logs.map((log) => {
            const mapping = AUDIT_ACTION_MAP[log.action] || {
                title: log.action,
                desc: () => `System action: ${log.action}`,
            };

            return {
                id: log.id,
                action: log.action,
                title: mapping.title,
                description: mapping.desc(log.entityId),
                userName: log.user.name,
                createdAt: log.createdAt,
            };
        }),
        status: 200,
    } as const;
}

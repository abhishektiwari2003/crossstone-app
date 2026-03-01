import { prisma } from "@/lib/prisma";
import { isAdmin, canViewProject, type AppRole } from "@/lib/authz";
import type { CreateQueryInput, UpdateQueryInput } from "./validation";
import type { QueryPriority, QueryStatus } from "@/generated/prisma";
import { logAudit } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";
import { sanitizeInput } from "@/lib/sanitize";

// ─── Priority → Color map ───
const PRIORITY_COLOR_MAP: Record<string, string> = {
    LOW: "gray",
    MEDIUM: "blue",
    HIGH: "orange",
    URGENT: "red",
};

// ─── Valid status transitions ───
const VALID_TRANSITIONS: Record<string, string[]> = {
    OPEN: ["IN_PROGRESS"],
    IN_PROGRESS: ["RESOLVED"],
    RESOLVED: [],
};

// ─── Create a query ───
export async function createQuery(
    projectId: string,
    data: CreateQueryInput,
    currentUser: { id: string; role: AppRole }
) {
    // Verify project membership via canViewProject
    const allowed = await canViewProject(currentUser.id, currentUser.role, projectId);
    if (!allowed) {
        return { error: "You are not a member of this project", status: 403 } as const;
    }

    // Validate attachments if provided
    if (data.attachmentIds && data.attachmentIds.length > 0) {
        const media = await prisma.media.findMany({
            where: { id: { in: data.attachmentIds } },
            select: { id: true, type: true, createdById: true },
        });
        if (media.length !== data.attachmentIds.length) {
            return { error: "One or more attachments not found", status: 404 } as const;
        }
        const invalid = media.filter(m => m.type !== "QUERY_ATTACHMENT");
        if (invalid.length > 0) {
            return { error: "All attachments must be of type QUERY_ATTACHMENT", status: 400 } as const;
        }
        const notOwned = media.filter(m => m.createdById !== currentUser.id);
        if (notOwned.length > 0) {
            return { error: "You can only attach media you have uploaded", status: 403 } as const;
        }
    }

    const query = await prisma.query.create({
        data: {
            projectId,
            authorId: currentUser.id,
            title: sanitizeInput(data.title),
            description: sanitizeInput(data.description),
            priority: data.priority as QueryPriority,
            ...(data.attachmentIds && data.attachmentIds.length > 0
                ? { attachments: { connect: data.attachmentIds.map(id => ({ id })) } }
                : {}),
        },
        include: {
            author: { select: { id: true, name: true } },
            attachments: { select: { id: true, fileUrl: true } },
            _count: { select: { responses: true } },
        },
    });

    await logAudit({
        userId: currentUser.id,
        action: "CREATE_QUERY",
        entity: "Query",
        entityId: query.id,
        projectId,
        metadata: {
            priority: data.priority,
            hasAttachments: !!(data.attachmentIds && data.attachmentIds.length > 0),
        },
    });

    const pmMembership = await prisma.projectMember.findFirst({
        where: { projectId, role: "PROJECT_MANAGER" }
    });

    if (pmMembership) {
        await createNotification({
            userId: pmMembership.userId,
            title: "New Query Created",
            message: `A new query "${query.title}" has been raised.`,
            type: "QUERY_CREATED",
            priority: query.priority === "URGENT" ? "HIGH" : "NORMAL",
            actionUrl: `/projects/${projectId}/queries/${query.id}`,
        });
    }

    return { query, status: 201 } as const;
}

// ─── Get paginated queries for a project (mobile-optimized) ───
export async function getPaginatedProjectQueries(
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

    const queries = await prisma.query.findMany({
        where: { projectId },
        select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            createdAt: true,
            _count: { select: { responses: true } },
        },
        take: take + 1,
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0,
        orderBy: { createdAt: "desc" },
    });

    const hasMore = queries.length > take;
    const items = hasMore ? queries.slice(0, take) : queries;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return {
        items: items.map(q => ({
            id: q.id,
            title: q.title,
            status: q.status,
            priority: q.priority,
            priorityColor: PRIORITY_COLOR_MAP[q.priority] ?? "gray",
            createdAt: q.createdAt,
            responseCount: q._count.responses,
        })),
        nextCursor,
        status: 200,
    } as const;
}

// ─── Get query detail with responses ───
export async function getQueryById(
    queryId: string,
    currentUser: { id: string; role: AppRole }
) {
    const query = await prisma.query.findUnique({
        where: { id: queryId },
        include: {
            author: { select: { id: true, name: true, role: true } },
            attachments: { select: { id: true, fileUrl: true, mimeType: true } },
            responses: {
                include: {
                    author: { select: { id: true, name: true, role: true } },
                },
                orderBy: { createdAt: "asc" },
            },
        },
    });

    if (!query) {
        return { error: "Query not found", status: 404 } as const;
    }

    // RBAC: verify project access
    const allowed = await canViewProject(currentUser.id, currentUser.role, query.projectId);
    if (!allowed) {
        return { error: "Forbidden", status: 403 } as const;
    }

    return {
        query: {
            id: query.id,
            title: query.title,
            description: query.description,
            status: query.status,
            priority: query.priority,
            priorityColor: PRIORITY_COLOR_MAP[query.priority] ?? "gray",
            createdAt: query.createdAt,
            author: {
                id: query.author.id,
                name: query.author.name,
                image: null,
                role: query.author.role,
            },
            attachments: query.attachments.map(a => ({ id: a.id, url: a.fileUrl })),
            responses: query.responses.map(r => ({
                id: r.id,
                queryId: r.queryId,
                authorId: r.author.id,
                message: r.message,
                createdAt: r.createdAt.toISOString(),
                author: {
                    id: r.author.id,
                    name: r.author.name,
                    image: null,
                    role: r.author.role,
                }
            })),
        },
        status: 200,
    } as const;
}

// ─── Update query status/priority (ADMIN/PM only) ───
export async function updateQuery(
    queryId: string,
    data: UpdateQueryInput,
    currentUser: { id: string; role: AppRole }
) {
    if (!isAdmin(currentUser.role) && currentUser.role !== "PROJECT_MANAGER") {
        return { error: "Forbidden", status: 403 } as const;
    }

    const query = await prisma.query.findUnique({ where: { id: queryId } });
    if (!query) {
        return { error: "Query not found", status: 404 } as const;
    }

    // Validate status transition
    if (data.status) {
        const allowed = VALID_TRANSITIONS[query.status];
        if (!allowed?.includes(data.status)) {
            return { error: `Invalid status transition: ${query.status} → ${data.status}`, status: 400 } as const;
        }
    }

    const updated = await prisma.query.update({
        where: { id: queryId },
        data: {
            ...(data.status ? { status: data.status as QueryStatus } : {}),
            ...(data.priority ? { priority: data.priority as QueryPriority } : {}),
        },
        select: {
            id: true,
            status: true,
            priority: true,
            updatedAt: true,
            projectId: true,
        },
    });

    await logAudit({
        userId: currentUser.id,
        action: "UPDATE_QUERY",
        entity: "Query",
        entityId: queryId,
        projectId: updated.projectId,
        metadata: {
            oldStatus: query.status,
            newStatus: updated.status,
            oldPriority: query.priority,
            newPriority: updated.priority,
        },
    });

    return { query: updated, status: 200 } as const;
}

// ─── Add a response to a query ───
export async function addQueryResponse(
    queryId: string,
    message: string,
    currentUser: { id: string; role: AppRole }
) {
    const query = await prisma.query.findUnique({
        where: { id: queryId },
        select: { id: true, projectId: true },
    });
    if (!query) {
        return { error: "Query not found", status: 404 } as const;
    }

    // Verify project membership
    const allowed = await canViewProject(currentUser.id, currentUser.role, query.projectId);
    if (!allowed) {
        return { error: "Forbidden", status: 403 } as const;
    }

    const response = await prisma.queryResponse.create({
        data: {
            queryId,
            authorId: currentUser.id,
            message: sanitizeInput(message),
        },
        include: {
            author: { select: { id: true, name: true, role: true } },
        },
    });

    await logAudit({
        userId: currentUser.id,
        action: "ADD_QUERY_RESPONSE",
        entity: "QueryResponse",
        entityId: response.id,
        projectId: query.projectId,
        metadata: {
            queryId,
        },
    });

    return {
        response: {
            id: response.id,
            queryId: response.queryId,
            authorId: response.authorId,
            message: response.message,
            createdAt: response.createdAt.toISOString(),
            author: {
                id: response.author.id,
                name: response.author.name,
                image: null,
                role: response.author.role,
            }
        },
        status: 201,
    } as const;
}

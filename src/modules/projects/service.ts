import { prisma } from "@/lib/prisma";
import { isAdmin, type AppRole } from "@/lib/authz";
import type { ProjectMemberRole } from "@/generated/prisma";
import { logAudit } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";

// ─── Shared include for members with user details ───
const membersInclude = {
    members: {
        include: {
            user: {
                select: { id: true, name: true, email: true, role: true },
            },
        },
    },
} as const;

// ─── Get projects filtered by the current user's role ───
export async function getProjectsForUser(userId: string, role: AppRole) {
    if (isAdmin(role)) {
        return prisma.project.findMany({ include: membersInclude });
    }

    if (role === "SITE_ENGINEER") {
        return prisma.project.findMany({
            where: {
                members: { some: { userId, role: "SITE_ENGINEER" } },
            },
            include: membersInclude,
        });
    }

    if (role === "PROJECT_MANAGER") {
        return prisma.project.findMany({
            where: {
                OR: [
                    { managerId: userId },
                    { members: { some: { userId, role: "PROJECT_MANAGER" } } },
                ],
            },
            include: membersInclude,
        });
    }

    // CLIENT — only their own projects
    return prisma.project.findMany({
        where: { clientId: userId },
        include: membersInclude,
    });
}

// ─── Add a member to a project ───
export async function addMember(
    projectId: string,
    userId: string,
    role: "SITE_ENGINEER" | "PROJECT_MANAGER",
    currentUser: { id: string; role: AppRole }
) {
    // 1. Only admins can add members
    if (!isAdmin(currentUser.role)) {
        return { error: "Forbidden", status: 403 } as const;
    }

    // 2. Verify project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
        return { error: "Project not found", status: 404 } as const;
    }

    // 3. Verify user exists and their global role matches
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true },
    });
    if (!user) {
        return { error: "User not found", status: 404 } as const;
    }

    // 4. Validate user's global role matches the membership role
    if (role === "SITE_ENGINEER" && user.role !== "SITE_ENGINEER") {
        return { error: "User must have SITE_ENGINEER role to be added as SITE_ENGINEER", status: 400 } as const;
    }
    if (role === "PROJECT_MANAGER" && user.role !== "PROJECT_MANAGER") {
        return { error: "User must have PROJECT_MANAGER role to be added as PROJECT_MANAGER", status: 400 } as const;
    }

    // 5. Check for duplicate (unique constraint)
    const existing = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId } },
    });
    if (existing) {
        return { error: "User is already a member of this project", status: 409 } as const;
    }

    // 6. Create the membership
    const member = await prisma.projectMember.create({
        data: {
            projectId,
            userId,
            role: role as ProjectMemberRole,
        },
        include: {
            user: {
                select: { id: true, name: true, email: true, role: true },
            },
        },
    });

    await logAudit({
        userId: currentUser.id,
        action: "ADD_MEMBER",
        entity: "ProjectMember",
        entityId: member.id,
        projectId,
        metadata: {
            addedUserId: userId,
            assignedRole: role,
        },
    });

    // Fire Notification to the assigned user
    await createNotification({
        userId,
        title: "New Project Assignment",
        message: `You have been added to ${project.name} as a ${role.replace("_", " ")}.`,
        type: "NEW_ASSIGNMENT",
        priority: "HIGH",
        actionUrl: `/projects/${projectId}`,
    });

    return { member, status: 201 } as const;
}

// ─── Remove a member from a project ───
export async function removeMember(
    projectId: string,
    memberId: string,
    currentUser: { id: string; role: AppRole }
) {
    // 1. Only admins can remove members
    if (!isAdmin(currentUser.role)) {
        return { error: "Forbidden", status: 403 } as const;
    }

    // 2. Find the membership and verify it belongs to this project
    const member = await prisma.projectMember.findUnique({
        where: { id: memberId },
    });
    if (!member || member.projectId !== projectId) {
        return { error: "Member not found in this project", status: 404 } as const;
    }

    // 3. Delete the membership
    await prisma.projectMember.delete({ where: { id: memberId } });

    await logAudit({
        userId: currentUser.id,
        action: "REMOVE_MEMBER",
        entity: "ProjectMember",
        entityId: memberId,
        projectId,
        metadata: {
            removedUserId: member.userId,
            removedRole: member.role,
        },
    });

    return { message: "Member removed successfully", status: 200 } as const;
}

// ─── Get all members for a project ───
export async function getProjectMembers(projectId: string) {
    return prisma.projectMember.findMany({
        where: { projectId },
        include: {
            user: {
                select: { id: true, name: true, email: true, role: true },
            },
        },
    });
}

// ─── Status → Color map for mobile badges ───
const STATUS_COLOR_MAP: Record<string, string> = {
    PLANNED: "purple",
    IN_PROGRESS: "blue",
    ON_HOLD: "amber",
    COMPLETED: "emerald",
};

// ─── Mobile DTO mapper ───
function mapProjectToMobileDTO(project: {
    id: string;
    name: string;
    status: string;
    createdAt: Date;
    _count: { members: number; inspections: number; milestones: number };
    media?: { id: string }[];
}) {
    return {
        id: project.id,
        name: project.name,
        status: project.status,
        statusColor: STATUS_COLOR_MAP[project.status] ?? "gray",
        memberCount: project._count.members,
        inspectionCount: project._count.inspections,
        drawingCount: project.media?.length ?? 0,
        createdAt: project.createdAt,
    };
}

// ─── Cursor-paginated projects for mobile ───
export async function getPaginatedProjects(
    userId: string,
    role: AppRole,
    cursor?: string | null,
    limit: number = 10
) {
    const take = Math.min(limit, 50);

    // Build RBAC where clause
    let where: Record<string, unknown> = {};
    if (role === "SITE_ENGINEER") {
        where = { members: { some: { userId, role: "SITE_ENGINEER" } } };
    } else if (role === "PROJECT_MANAGER") {
        where = { OR: [{ managerId: userId }, { members: { some: { userId, role: "PROJECT_MANAGER" } } }] };
    } else if (role === "CLIENT") {
        where = { clientId: userId };
    }
    // Admin → no where filter

    const projects = await prisma.project.findMany({
        where: isAdmin(role) ? undefined : where,
        select: {
            id: true,
            name: true,
            status: true,
            createdAt: true,
            _count: {
                select: {
                    members: true,
                    inspections: true,
                    milestones: true,
                },
            },
            media: {
                where: { type: "DRAWING" },
                select: { id: true },
            },
        },
        take: take + 1,
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0,
        orderBy: { createdAt: "desc" },
    });

    const hasMore = projects.length > take;
    const items = hasMore ? projects.slice(0, take) : projects;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return {
        items: items.map(mapProjectToMobileDTO),
        nextCursor,
    };
}

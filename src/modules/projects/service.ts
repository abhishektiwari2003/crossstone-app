import { prisma } from "@/lib/prisma";
import { isAdmin, type AppRole } from "@/lib/authz";
import type { ProjectMemberRole, Role } from "@/generated/prisma";

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

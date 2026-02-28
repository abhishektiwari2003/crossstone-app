import { prisma } from "@/lib/prisma";

export type AppRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "PROJECT_MANAGER"
  | "SITE_ENGINEER"
  | "CLIENT";

export const Role = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  PROJECT_MANAGER: "PROJECT_MANAGER",
  SITE_ENGINEER: "SITE_ENGINEER",
  CLIENT: "CLIENT",
} as const;

export function isAdmin(role?: AppRole | null) {
  return role === Role.SUPER_ADMIN || role === Role.ADMIN;
}

export function canManageUsers(role?: AppRole | null) {
  return isAdmin(role);
}

export function canManageProjects(role?: AppRole | null) {
  return isAdmin(role);
}

export function canEditPayments(role?: AppRole | null) {
  return role === Role.SUPER_ADMIN || role === Role.ADMIN || role === Role.PROJECT_MANAGER;
}

export function canManageMaterials(role?: AppRole | null) {
  return role === Role.SUPER_ADMIN || role === Role.ADMIN || role === Role.PROJECT_MANAGER;
}

export function canCreateProjectUpdate(role?: AppRole | null) {
  return role === Role.PROJECT_MANAGER || role === Role.SITE_ENGINEER || isAdmin(role);
}

/**
 * Check whether a user can view a specific project.
 * - ADMIN / SUPER_ADMIN → always true
 * - SITE_ENGINEER → must be a ProjectMember with role SITE_ENGINEER
 * - PROJECT_MANAGER → project.managerId matches OR ProjectMember with role PROJECT_MANAGER
 * - CLIENT → project.clientId matches
 */
export async function canViewProject(
  userId: string,
  role: AppRole,
  projectId: string
): Promise<boolean> {
  if (isAdmin(role)) return true;

  if (role === "SITE_ENGINEER") {
    const membership = await prisma.projectMember.findFirst({
      where: { projectId, userId, role: "SITE_ENGINEER" },
    });
    return !!membership;
  }

  if (role === "PROJECT_MANAGER") {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { managerId: true },
    });
    if (project?.managerId === userId) return true;

    const membership = await prisma.projectMember.findFirst({
      where: { projectId, userId, role: "PROJECT_MANAGER" },
    });
    return !!membership;
  }

  if (role === "CLIENT") {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { clientId: true },
    });
    return project?.clientId === userId;
  }

  return false;
}


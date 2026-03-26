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

export function isSuperAdmin(role?: AppRole | null) {
  return role === Role.SUPER_ADMIN;
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

/** True if user is primary manager or PM project member (used for milestone/drawing management). */
export async function isProjectManagerOnProject(
  userId: string,
  projectId: string
): Promise<boolean> {
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

/** Admins or project managers (primary or member) assigned to this project. */
export async function canManageProjectMilestones(
  userId: string,
  role: AppRole,
  projectId: string
): Promise<boolean> {
  if (isAdmin(role)) return true;
  if (role !== "PROJECT_MANAGER") return false;
  return isProjectManagerOnProject(userId, projectId);
}

/** Same scope as milestones: admins + PMs on the project. */
export async function canUploadProjectDrawings(
  userId: string,
  role: AppRole,
  projectId: string
): Promise<boolean> {
  return canManageProjectMilestones(userId, role, projectId);
}

export async function isSiteEngineerOnProject(
  userId: string,
  projectId: string
): Promise<boolean> {
  const membership = await prisma.projectMember.findFirst({
    where: { projectId, userId, role: "SITE_ENGINEER" },
  });
  return !!membership;
}

/** PM on project or admin: may add/remove project members (roster). */
export async function canManageProjectRoster(
  userId: string,
  role: AppRole,
  projectId: string
): Promise<boolean> {
  return canManageProjectMilestones(userId, role, projectId);
}

/**
 * Authorization error thrown by validateProjectAccess.
 * Caught by route handlers to return proper HTTP responses.
 */
export class AuthorizationError extends Error {
  public status: number;

  constructor(message: string = "Forbidden", status: number = 403) {
    super(message);
    this.name = "AuthorizationError";
    this.status = status;
  }
}

/**
 * Validate that a user has access to a project.
 * Throws AuthorizationError if not allowed — eliminates boilerplate in routes.
 * 
 * Usage:
 *   await validateProjectAccess(userId, role, projectId);
 *   // If we reach here, access is granted
 */
export async function validateProjectAccess(
  userId: string,
  role: AppRole,
  projectId: string
): Promise<void> {
  const allowed = await canViewProject(userId, role, projectId);
  if (!allowed) {
    throw new AuthorizationError("You do not have access to this project");
  }
}


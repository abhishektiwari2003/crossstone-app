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

export function canCreateProjectUpdate(role?: AppRole | null) {
  return role === Role.PROJECT_MANAGER || role === Role.SITE_ENGINEER || isAdmin(role);
}


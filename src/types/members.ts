// ─── Types matching the backend API contract for project members ───

export type MemberUser = {
    id: string;
    name: string | null;
    email: string;
    role: string;
};

export type ProjectMember = {
    id: string;
    user: MemberUser;
    role: "SITE_ENGINEER" | "PROJECT_MANAGER";
};

export type ProjectWithMembers = {
    id: string;
    name: string;
    status: string;
    description?: string | null;
    members?: ProjectMember[];
};

export type UserProfileStats = {
    totalProjects: number;
    inspectionsCompleted: number;
    updatesPosted: number;
    queriesHandled: number;
    paymentsApproved: number;
};

export type UserProfileTimelineItem = {
    id: string;
    type: "AUDIT";
    action: string;
    entity: string;
    createdAt: string;
    project?: { id: string; name: string } | null;
};

export type UserProfileProjectAssigned = {
    id: string;
    role: string;
    createdAt: string;
    project: {
        id: string;
        name: string;
        status: string;
        manager?: { name: string } | null;
    }
};

export type UserProfileResponse = {
    user: {
        id: string;
        name: string;
        email: string;
        phone: string | null;
        role: string;
        designation: string | null;
        createdAt: string;
        isActive: boolean;
    };
    statsSummary: UserProfileStats;
    activityTimeline: UserProfileTimelineItem[];
    projectsAssigned: UserProfileProjectAssigned[];
    inspectionsDone: unknown[];
    updatesPosted: unknown[];
    queriesCreated: unknown[];
    paymentsHandled: unknown[];
};

/** Serializable subset passed from Server Components to `UserActivityTabs` (no Prisma Decimal, etc.). */
export type UserActivityTabsData = Pick<UserProfileResponse, "projectsAssigned" | "activityTimeline">;

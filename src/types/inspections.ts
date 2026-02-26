// ─── Types matching backend API contract for inspections ───

export type ChecklistItem = {
    id: string;
    title: string;
    description?: string | null;
    order: number;
    isRequired: boolean;
    isPhotoRequired: boolean;
};

export type Milestone = {
    id: string;
    name: string;
    description?: string | null;
    order: number;
    isActive: boolean;
    projectId: string;
    checklistItems: ChecklistItem[];
    createdAt?: string;
};

export type ChecklistResult = "PASS" | "FAIL" | "NA";

export type InspectionResponse = {
    checklistItemId: string;
    result: ChecklistResult;
    remark?: string | null;
    mediaId?: string | null;
};

export type InspectionStatus = "DRAFT" | "SUBMITTED" | "REVIEWED";

export type Inspection = {
    id: string;
    projectId: string;
    milestoneId: string;
    status: InspectionStatus;
    engineerId: string;
    engineer: { id: string; name: string; email: string };
    milestone: { id: string; name: string; order: number };
    responses: {
        id: string;
        checklistItemId: string;
        result: ChecklistResult;
        remark?: string | null;
        mediaId?: string | null;
        checklistItem: ChecklistItem;
        media?: { id: string; fileKey: string; fileUrl: string; mimeType: string } | null;
    }[];
    reviewedBy?: { id: string; name: string; email: string } | null;
    createdAt: string;
    updatedAt: string;
};

// Draft shape stored in localStorage
export type InspectionDraft = {
    responses: Record<string, {
        result: ChecklistResult | null;
        remark: string;
        mediaId: string | null;
    }>;
    updatedAt: number;
};

// ─── Types matching backend Drawing API contract ───

export type DrawingStatus = "pending" | "approved" | "superseded";

export type Drawing = {
    id: string;
    url: string;
    version: number | null;
    approvedAt: string | null;
    approvedBy: string | null;
    createdAt: string;
    uploadedBy: { id: string; name: string };
};

// Derive status from drawing data + context
export function getDrawingStatus(drawing: Drawing, allDrawings: Drawing[]): DrawingStatus {
    const isApproved = !!drawing.approvedAt;

    // Check if a newer version exists and is approved
    const newerApproved = allDrawings.some(
        d => d.id !== drawing.id &&
            (d.version || 0) > (drawing.version || 0) &&
            !!d.approvedAt
    );

    if (isApproved && newerApproved) return "superseded";
    if (isApproved) return "approved";
    return "pending";
}

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "PROJECT_MANAGER" | "SITE_ENGINEER" | "CLIENT";

export function canApproveDrawing(role: UserRole): boolean {
    return role === "SUPER_ADMIN" || role === "ADMIN";
}

export function canDeleteDrawing(role: UserRole, drawing: Drawing): boolean {
    if (role === "SUPER_ADMIN") return true;
    if (role === "ADMIN" && !drawing.approvedAt) return true;
    return false;
}

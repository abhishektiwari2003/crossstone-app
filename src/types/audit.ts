export type AuditLogAction =
    | "CREATE_DRAWING"
    | "UPDATE_DRAWING"
    | "APPROVE_DRAWING"
    | "SUBMIT_INSPECTION"
    | "REVIEW_INSPECTION"
    | "CREATE_QUERY"
    | "UPDATE_QUERY"
    | "ADD_QUERY_RESPONSE"
    | "RECORD_PAYMENT"
    | "UPDATE_PAYMENT"
    | "CREATE_PROJECT"
    | "UPDATE_PROJECT"
    | "CREATE_USER"
    | "UPDATE_USER"
    | string; // Fallback for any unknown actions

export type AuditLogEntity =
    | "Drawing"
    | "Inspection"
    | "Query"
    | "QueryResponse"
    | "Payment"
    | "Project"
    | "User"
    | string;

export interface AuditLog {
    id: string;
    userId: string;
    userName?: string; // Often joined from User table
    action: AuditLogAction;
    entity: AuditLogEntity;
    entityId: string;
    projectId?: string | null;
    metadata: Record<string, any>;
    createdAt: string; // ISO DateTime
}

export interface ProjectActivity {
    id: string;
    userName: string;
    action: AuditLogAction;
    entity: AuditLogEntity;
    metadata: Record<string, any>;
    createdAt: string; // ISO DateTime
}

export interface AuditLogFilters {
    projectId?: string;
    userId?: string;
    action?: string;
    page?: number;
    limit?: number;
}

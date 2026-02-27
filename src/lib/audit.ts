import { prisma } from "@/lib/prisma";

type AuditLogParams = {
    userId: string;
    action: string;
    entity: string;
    entityId: string;
    projectId?: string;
    metadata?: any;
};

/**
 * Utility to asynchronously log an audit event.
 * It's structured to fail silently without breaking the main business flow.
 */
export async function logAudit({
    userId,
    action,
    entity,
    entityId,
    projectId,
    metadata,
}: AuditLogParams) {
    try {
        await (prisma as any).auditLog.create({
            data: {
                userId,
                action,
                entity,
                entityId,
                projectId,
                metadata: metadata || null,
            },
        });
    } catch (error) {
        console.error("[AUDIT_LOG_ERROR] Failed to save audit log:", {
            action,
            entity,
            entityId,
            error,
        });
        // We purposefully catch the error and do NOT throw,
        // to ensure the parent transaction/business logic is not blocked.
    }
}

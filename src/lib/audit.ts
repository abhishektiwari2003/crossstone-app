import { prisma } from "@/lib/prisma";

type AuditLogParams = {
    userId: string;
    action: string;
    entity: string;
    entityId: string;
    projectId?: string;
    metadata?: Record<string, unknown>;
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

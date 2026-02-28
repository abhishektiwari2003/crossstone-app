import { prisma } from "@/lib/prisma";
import { NotificationPriority } from "@/generated/prisma";

export type NotificationType =
    | "INSPECTION_SUBMITTED"
    | "PAYMENT_OVERDUE"
    | "NEW_ASSIGNMENT"
    | "QUERY_CREATED"
    | "DRAWING_APPROVED";

export interface CreateNotificationParams {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    priority?: NotificationPriority;
    actionUrl?: string;
}

/**
 * Maps the generic notification type to the specific boolean toggle
 * on the User's NotificationPreference model.
 */
function getPreferenceFlagForType(type: NotificationType): keyof Omit<
    NonNullable<Awaited<ReturnType<typeof prisma.notificationPreference.findUnique>>>,
    "id" | "userId" | "emailEnabled" | "inAppEnabled" | "updatedAt"
> {
    switch (type) {
        case "INSPECTION_SUBMITTED":
            return "inspectionSubmitted";
        case "PAYMENT_OVERDUE":
            return "paymentOverdue";
        case "NEW_ASSIGNMENT":
            return "newAssignment";
        case "QUERY_CREATED":
            return "queryCreated";
        case "DRAWING_APPROVED":
            return "drawingApproved";
    }
}

/**
 * Core engine to dispatch a notification safely.
 * Will respect the user's `NotificationPreference`. If the model doesn't exist,
 * it will automatically create the default fully-opted-in model.
 */
export async function createNotification(params: CreateNotificationParams) {
    try {
        // 1. Fetch user preference, or create default if it doesn't exist
        let prefs = await prisma.notificationPreference.findUnique({
            where: { userId: params.userId },
        });

        if (!prefs) {
            prefs = await prisma.notificationPreference.create({
                data: { userId: params.userId },
            });
        }

        // 2. Check global In-App toggle
        if (!prefs.inAppEnabled) {
            return null;
        }

        // 3. Check specific event toggle
        const flag = getPreferenceFlagForType(params.type);
        // @ts-ignore - TS doesn't love indexing with mapped keys dynamically, but functionally safe here.
        const isEventEnabled = prefs[flag];

        if (!isEventEnabled) {
            return null;
        }

        // 4. Create Notification
        const notification = await prisma.notification.create({
            data: {
                userId: params.userId,
                title: params.title,
                message: params.message,
                type: params.type,
                priority: params.priority || "NORMAL",
                actionUrl: params.actionUrl,
            },
        });

        // 5. Future-Ready: Email Dispatch Hook
        if (prefs.emailEnabled) {
            // e.g. await sendEmail({ to: user.email, subject: params.title, ... })
            console.log(`[Email Dispatch Queued] To User: ${params.userId}, Title: ${params.title}`);
        }

        return notification;
    } catch (error) {
        // Fail silently to prevent blowing up the parent transaction
        console.error("Failed to create notification:", error);
        return null;
    }
}

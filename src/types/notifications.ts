import useSWR from "swr";

export type NotificationType = "INSPECTION" | "PAYMENT" | "DRAWING" | "QUERY" | "ASSIGNMENT" | "SYSTEM" | string;
export type NotificationPriority = "LOW" | "NORMAL" | "HIGH";

export interface NotificationItem {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    actionUrl: string | null;
    priority: NotificationPriority;
    isRead: boolean;
    createdAt: string;
}

export interface NotificationsResponse {
    items: NotificationItem[];
    unreadCount: number;
    nextCursor: string | null;
    error?: string;
}

export interface NotificationPreferences {
    id: string;
    userId: string;
    emailAlerts: boolean;
    inAppAlerts: boolean;
    notifyOnInspection: boolean;
    notifyOnPayment: boolean;
    notifyOnAssignment: boolean;
    notifyOnQuery: boolean;
    notifyOnDrawing: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useNotifications(limit: number = 20) {
    const { data, error, isLoading, mutate } = useSWR<NotificationsResponse>(
        `/api/notifications?limit=${limit}`,
        fetcher,
        {
            refreshInterval: 60000, // Poll every 1 minute
            revalidateOnFocus: true,
            fallbackData: { items: [], unreadCount: 0, nextCursor: null },
        }
    );

    const markAsRead = async (id: string) => {
        // Optimistic UI update
        if (data) {
            mutate(
                {
                    ...data,
                    items: data.items.map(n => n.id === id ? { ...n, isRead: true } : n),
                    unreadCount: Math.max(0, data.unreadCount - 1),
                },
                false
            );
        }

        try {
            await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
        } catch (e) {
            console.error("Failed to mark notification as read", e);
        }
        mutate();
    };

    const markAllAsRead = async () => {
        // Optimistic UI update
        if (data) {
            mutate(
                {
                    ...data,
                    items: data.items.map(n => ({ ...n, isRead: true })),
                    unreadCount: 0,
                },
                false
            );
        }

        try {
            await fetch(`/api/notifications/mark-all-read`, { method: "PATCH" });
        } catch (e) {
            console.error("Failed to mark all notifications as read", e);
        }
        mutate();
    };

    return {
        notifications: data?.items || [],
        unreadCount: data?.unreadCount || 0,
        nextCursor: data?.nextCursor,
        isLoading,
        isError: !!error || !!data?.error,
        markAsRead,
        markAllAsRead,
        mutate,
    };
}

export function useNotificationPreferences() {
    const { data, error, isLoading, mutate } = useSWR<{ preferences: NotificationPreferences; error?: string }>(
        `/api/notifications/preferences`,
        fetcher
    );

    const updatePreferences = async (newPrefs: Partial<NotificationPreferences>) => {
        if (data?.preferences) {
            mutate(
                { preferences: { ...data.preferences, ...newPrefs } },
                false
            );
        }

        try {
            const res = await fetch(`/api/notifications/preferences`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newPrefs),
            });
            if (!res.ok) throw new Error("Failed to save preferences");
        } catch (e) {
            console.error(e);
            throw e;
        }
        mutate();
    };

    return {
        preferences: data?.preferences,
        isLoading,
        isError: !!error || !!data?.error,
        updatePreferences,
        mutate,
    };
}

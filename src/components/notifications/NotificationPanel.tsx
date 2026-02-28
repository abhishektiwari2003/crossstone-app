"use client";

import { useNotifications } from "@/types/notifications";
import { NotificationCard } from "./NotificationCard";
import { Button } from "@/components/ui/button";
import { BellRing, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Props {
    className?: string;
    onClose?: () => void;
}

export function NotificationPanel({ className, onClose }: Props) {
    const { notifications, isLoading, isError, markAsRead, markAllAsRead, unreadCount } = useNotifications();

    const handleMarkAllRead = async () => {
        await markAllAsRead();
    };

    let content;

    if (isLoading && notifications.length === 0) {
        content = (
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                <p className="text-sm text-slate-500">Loading notifications...</p>
            </div>
        );
    } else if (isError) {
        content = (
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-2 text-center">
                <div className="h-12 w-12 rounded-full bg-rose-50 flex items-center justify-center mb-2">
                    <BellRing className="h-6 w-6 text-rose-500" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">Failed to load</h3>
                <p className="text-xs text-slate-500">We couldn't load your alerts. Please try again.</p>
            </div>
        );
    } else if (notifications.length === 0) {
        content = (
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-3 text-center">
                <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mb-2 shadow-sm border border-slate-100">
                    <BellRing className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">All caught up!</h3>
                <p className="text-sm text-slate-500 max-w-[200px]">You have no new notifications right now. Enjoy your day.</p>
            </div>
        );
    } else {
        content = (
            <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-slate-100">
                {notifications.map((notification) => (
                    <NotificationCard
                        key={notification.id}
                        notification={notification}
                        onMarkRead={markAsRead}
                    />
                ))}
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col h-full bg-white", className)}>
            {/* Header section */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-slate-900">Notifications</h2>
                    {unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                            {unreadCount}
                        </span>
                    )}
                </div>

                {unreadCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMarkAllRead}
                        className="h-8 px-2 text-xs text-slate-500 hover:text-indigo-600 hover:bg-slate-50"
                    >
                        Mark all as read
                    </Button>
                )}
            </div>

            {/* Scrollable Content */}
            {content}

            {/* Sticky Action Footer */}
            <div className="p-2 border-t border-slate-100 bg-slate-50 shrink-0 text-center">
                <Link
                    href="/settings/notifications"
                    onClick={onClose}
                    className="text-xs text-slate-500 hover:text-indigo-600 font-medium inline-block py-1"
                >
                    Manage Preferences
                </Link>
            </div>
        </div>
    );
}

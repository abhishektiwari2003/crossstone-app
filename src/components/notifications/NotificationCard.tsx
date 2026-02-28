import { useState } from "react";
import { formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { Check, ClipboardList, CreditCard, FileText, MessageSquare, AlertCircle, Loader2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NotificationItem } from "@/types/notifications";
import Link from "next/link";

interface Props {
    notification: NotificationItem;
    onMarkRead: (id: string) => void;
}

export function NotificationCard({ notification, onMarkRead }: Props) {
    const isUnread = !notification.isRead;

    const getIconInfo = (type: string) => {
        switch (type) {
            case "INSPECTION": return { icon: ClipboardList, color: "text-blue-500", bg: "bg-blue-500/10" };
            case "PAYMENT": return { icon: CreditCard, color: "text-emerald-500", bg: "bg-emerald-500/10" };
            case "DRAWING": return { icon: FileText, color: "text-purple-500", bg: "bg-purple-500/10" };
            case "QUERY": return { icon: MessageSquare, color: "text-amber-500", bg: "bg-amber-500/10" };
            case "SYSTEM": return { icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-500/10" };
            default: return { icon: Info, color: "text-slate-500", bg: "bg-slate-500/10" };
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "HIGH": return "border-l-rose-500";
            case "NORMAL": return "border-l-blue-500";
            default: return "border-l-transparent";
        }
    };

    const { icon: Icon, color, bg } = getIconInfo(notification.type);
    const priorityClass = getPriorityColor(notification.priority);

    const handleClick = () => {
        if (!notification.isRead) {
            onMarkRead(notification.id);
        }
    };

    const content = (
        <div className={cn(
            "relative p-4 flex gap-4 transition-all duration-200 hover:bg-slate-50 border-l-4 sm:rounded-r-xl",
            priorityClass,
            isUnread ? "bg-white" : "bg-slate-50/50 opacity-75 grayscale-[0.2]"
        )}>
            {/* Unread Indicator */}
            {isUnread && (
                <div className="absolute top-1/2 -translate-y-1/2 left-0 -ml-1.5 w-2 h-2 rounded-full bg-blue-500" />
            )}

            {/* Icon */}
            <div className={cn("mt-1 flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center", bg)}>
                <Icon className={cn("h-5 w-5", color)} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <p className={cn(
                        "text-sm font-semibold truncate",
                        isUnread ? "text-slate-900" : "text-slate-700 font-medium"
                    )}>
                        {notification.title}
                    </p>
                    <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2">
                    {notification.message}
                </p>
            </div>

            {/* Mark as read button (Visual only, handled by parent link click optimally) */}
            {isUnread && !notification.actionUrl && (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onMarkRead(notification.id);
                    }}
                    className="flex-shrink-0 h-8 w-8 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-500 transition-colors"
                >
                    <Check className="h-4 w-4" />
                </button>
            )}
        </div>
    );

    if (notification.actionUrl) {
        return (
            <Link
                href={notification.actionUrl}
                onClick={handleClick}
                className="block border-b border-slate-100 last:border-0"
            >
                {content}
            </Link>
        );
    }

    return (
        <div className="block border-b border-slate-100 last:border-0 cursor-default">
            {content}
        </div>
    );
}

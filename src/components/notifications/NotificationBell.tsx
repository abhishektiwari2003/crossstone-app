"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "@/types/notifications";
import { NotificationPanel } from "./NotificationPanel";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

export function NotificationBell() {
    const { unreadCount } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 768px)");

    const trigger = (
        <button
            className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
                <span className={cn(
                    "absolute top-1.5 right-1.5 flex h-2 w-2",
                    "before:absolute before:inline-flex before:h-full before:w-full before:rounded-full before:bg-rose-400 before:opacity-75 before:animate-ping"
                )}>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
            )}
        </button>
    );

    // Desktop: Popover Dropdown
    if (isDesktop) {
        return (
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    {trigger}
                </PopoverTrigger>
                <PopoverContent
                    align="end"
                    sideOffset={8}
                    className="w-[380px] p-0 rounded-2xl shadow-xl overflow-hidden border-slate-200"
                >
                    <NotificationPanel className="max-h-[80vh]" onClose={() => setIsOpen(false)} />
                </PopoverContent>
            </Popover>
        );
    }

    // Mobile: Full Sheet
    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                {trigger}
            </SheetTrigger>
            <SheetContent
                side="bottom"
                className="h-[90dvh] p-0 rounded-t-3xl overflow-hidden border-0"
            >
                {/* Drag handle hint for mobile */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-200 rounded-full z-10" />
                <NotificationPanel className="h-full pt-4" onClose={() => setIsOpen(false)} />
            </SheetContent>
        </Sheet>
    );
}

"use client";

export default function ContactSkeleton() {
    return (
        <div className="glass-card p-4 animate-pulse">
            {/* Avatar + Info skeleton */}
            <div className="flex items-start gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="h-5 w-2/3 bg-slate-200 rounded" />
                    <div className="h-4 w-1/4 bg-slate-200 rounded-full" />
                    <div className="h-3 w-1/2 bg-slate-200 rounded" />
                </div>
            </div>
            {/* Divider */}
            <div className="border-t border-slate-100 my-3" />
            {/* Buttons skeleton */}
            <div className="flex items-center gap-2">
                <div className="flex-1 h-[44px] bg-slate-200 rounded-xl" />
                <div className="flex-1 h-[44px] bg-slate-200 rounded-xl" />
                <div className="flex-1 h-[44px] bg-slate-200 rounded-xl" />
            </div>
        </div>
    );
}

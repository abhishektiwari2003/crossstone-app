"use client";

import { CheckCircle2, Clock, MessageSquare, CreditCard, FileText, UserPlus, AlertTriangle } from "lucide-react";

export type ActivityItem = {
    id: string;
    type: "PAYMENT" | "QUERY" | "DOCUMENT" | "USER" | "SYSTEM";
    title: string;
    description: string;
    time: string;
    status?: "success" | "warning" | "info";
};

type Props = {
    activities: ActivityItem[];
};

export default function RecentActivityTimeline({ activities }: Props) {
    if (!activities || activities.length === 0) {
        return (
            <div className="glass-card p-6 flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/10">
                <h2 className="text-lg font-bold text-foreground mb-6">Recent Activity</h2>
                <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                    <Clock className="h-8 w-8 text-muted-foreground mb-3" />
                    <p className="text-sm font-semibold text-foreground">All caught up!</p>
                    <p className="text-xs text-muted-foreground mt-1">No recent activity on your projects.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-6 flex flex-col h-full">
            <h2 className="text-lg font-bold text-foreground mb-6">Recent Activity</h2>

            <div className="relative pl-3 space-y-6 before:absolute before:inset-y-0 before:left-[21px] before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
                {activities.map((item) => {
                    let Icon = CheckCircle2;
                    let iconBg = "bg-slate-100 text-slate-500";
                    let glow = "";

                    if (item.type === "PAYMENT") {
                        Icon = CreditCard;
                        iconBg = "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400";
                        glow = "ring-4 ring-emerald-50 dark:ring-emerald-900/20";
                    } else if (item.type === "QUERY") {
                        Icon = MessageSquare;
                        iconBg = "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400";
                        glow = "ring-4 ring-amber-50 dark:ring-amber-900/20";
                    } else if (item.type === "DOCUMENT") {
                        Icon = FileText;
                        iconBg = "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
                        glow = "ring-4 ring-blue-50 dark:ring-blue-900/20";
                    } else if (item.type === "USER") {
                        Icon = UserPlus;
                        iconBg = "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
                        glow = "ring-4 ring-purple-50 dark:ring-purple-900/20";
                    } else if (item.type === "SYSTEM" && item.status === "warning") {
                        Icon = AlertTriangle;
                        iconBg = "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
                        glow = "ring-4 ring-red-50 dark:ring-red-900/20";
                    }

                    return (
                        <div key={item.id} className="relative flex gap-4 group">
                            <div className="absolute -left-3 top-0 bottom-0 w-8 flex justify-center">
                                {/* The line is drawn globally by the container's pseudo element. This div just positions the icon. */}
                            </div>

                            {/* Icon Node */}
                            <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${iconBg} ${glow} transition-transform group-hover:scale-110 shadow-sm border border-white/50 dark:border-white/5`}>
                                <Icon className="h-4 w-4" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 pb-1 pt-1 -mt-1 group-hover:translate-x-1 transition-transform">
                                <div className="flex justify-between items-start gap-2">
                                    <h4 className="text-sm font-bold text-foreground">{item.title}</h4>
                                    <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap pt-1">
                                        {item.time}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <button className="w-full mt-6 py-2.5 rounded-xl border border-dashed border-border text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                View full activity log
            </button>
        </div>
    );
}

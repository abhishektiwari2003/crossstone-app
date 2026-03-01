"use client";

import type { UserProfileStats } from "@/types/user-profile";
import { FolderKanban, ClipboardCheck, FileText, HelpCircle, IndianRupee } from "lucide-react";

type Props = {
    stats: UserProfileStats;
};

export default function UserStatsCards({ stats }: Props) {
    const cards = [
        {
            title: "Projects",
            value: stats.totalProjects,
            icon: FolderKanban,
            color: "text-blue-600",
            bg: "bg-blue-50",
            borderColor: "border-blue-100"
        },
        {
            title: "Inspections",
            value: stats.inspectionsCompleted,
            icon: ClipboardCheck,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            borderColor: "border-emerald-100"
        },
        {
            title: "Updates",
            value: stats.updatesPosted,
            icon: FileText,
            color: "text-purple-600",
            bg: "bg-purple-50",
            borderColor: "border-purple-100"
        },
        {
            title: "Queries",
            value: stats.queriesHandled,
            icon: HelpCircle,
            color: "text-orange-600",
            bg: "bg-orange-50",
            borderColor: "border-orange-100"
        },
        {
            title: "Payments",
            value: stats.paymentsApproved,
            icon: IndianRupee,
            color: "text-slate-600",
            bg: "bg-slate-50",
            borderColor: "border-slate-100"
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
            {cards.map((card, i) => (
                <div key={i} className={`glass-card p-4 lg:p-5 flex flex-col justify-between hover-lift border-t-4 border-l-0 border-r-0 border-b-0 ${card.borderColor}`}>
                    <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                            <card.icon className={`h-5 w-5 ${card.color}`} />
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900">{card.value}</div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-1">{card.title}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

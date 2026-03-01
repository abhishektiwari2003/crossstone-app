"use client";

import type { UserProfileTimelineItem } from "@/types/user-profile";
import { ClipboardCheck, FileText, HelpCircle, IndianRupee, HandHeart, UserPlus, Info } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

type Props = {
    timeline: UserProfileTimelineItem[];
};

export default function UserActivityTimeline({ timeline }: Props) {
    if (!timeline || timeline.length === 0) {
        return (
            <div className="glass-card p-12 text-center mt-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Info className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">No activity recorded</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">This user has not performed any recorded actions yet.</p>
            </div>
        );
    }

    function getTimelineConfig(action: string, entity: string) {
        const actionEntity = `${action}_${entity}`.toUpperCase();

        if (actionEntity.includes("INSPECTION")) {
            return {
                icon: ClipboardCheck,
                color: "text-emerald-600",
                bg: "bg-emerald-100",
                label: "Completed an Inspection",
                border: "border-emerald-200"
            };
        }
        if (actionEntity.includes("UPDATE")) {
            return {
                icon: FileText,
                color: "text-purple-600",
                bg: "bg-purple-100",
                label: "Posted a Project Update",
                border: "border-purple-200"
            };
        }
        if (actionEntity.includes("QUERY")) {
            return {
                icon: HelpCircle,
                color: "text-orange-600",
                bg: "bg-orange-100",
                label: "Created or Replied to a Query",
                border: "border-orange-200"
            };
        }
        if (actionEntity.includes("PAYMENT")) {
            return {
                icon: IndianRupee,
                color: "text-blue-600",
                bg: "bg-blue-100",
                label: "Approved/Created a Payment",
                border: "border-blue-200"
            };
        }
        if (actionEntity.includes("MEMBER")) {
            return {
                icon: UserPlus,
                color: "text-amber-600",
                bg: "bg-amber-100",
                label: "Added to a Project",
                border: "border-amber-200"
            };
        }

        return {
            icon: HandHeart,
            color: "text-slate-600",
            bg: "bg-slate-100",
            label: `Performed ${action} on ${entity}`,
            border: "border-slate-200"
        };
    }

    return (
        <div className="relative border-l-2 border-slate-100 ml-4 lg:ml-8 mt-6 space-y-8 pb-8">
            {timeline.map((item, idx) => {
                const config = getTimelineConfig(item.action, item.entity);

                return (
                    <div key={item.id || idx} className="relative pl-8">
                        {/* Timeline Icon Node */}
                        <div className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full ${config.bg} border border-white shadow-sm flex items-center justify-center`}>
                            <config.icon className={`h-4 w-4 ${config.color}`} />
                        </div>

                        {/* Content Card */}
                        <div className={`glass-card p-4 hover-lift border-t-0 border-l-4 border-r-0 border-b-0 ${config.border}`}>
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 leading-tight">
                                        {config.label}
                                    </h4>
                                    {item.project && (
                                        <p className="text-xs font-semibold text-indigo-600 mt-1">
                                            Project: <Link href={`/projects/${item.project.id}`} className="hover:underline">{item.project.name}</Link>
                                        </p>
                                    )}
                                </div>
                                <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

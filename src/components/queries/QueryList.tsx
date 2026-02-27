"use client";

import { MessageCircle, FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Query } from "@/types/queries";

type Props = {
    queries: Query[];
    onSelectQuery: (id: string) => void;
};

const PRIORITY_STYLES = {
    LOW: "bg-slate-100 text-slate-600",
    MEDIUM: "bg-blue-50 text-blue-700",
    HIGH: "bg-orange-50 text-orange-700 font-bold",
    URGENT: "bg-red-100 text-red-700 font-bold border border-red-200"
};

const STATUS_UI = {
    OPEN: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-50", label: "Open" },
    IN_PROGRESS: { icon: Clock, color: "text-orange-500", bg: "bg-orange-50", label: "In Progress" },
    RESOLVED: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50", label: "Resolved" }
};

export default function QueryList({ queries, onSelectQuery }: Props) {
    if (queries.length === 0) {
        return (
            <div className="glass-card p-12 text-center flex flex-col items-center justify-center border-dashed border-2 bg-slate-50/50">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <MessageCircle className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">No Issues Reported</h3>
                <p className="text-sm text-slate-500 max-w-sm">
                    Everything looks good! Clients can raise new project issues or queries here.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {queries.map((q) => {
                const Status = STATUS_UI[q.status];
                const StatusIcon = Status.icon;

                return (
                    <button
                        key={q.id}
                        onClick={() => onSelectQuery(q.id)}
                        className="glass-card p-5 text-left hover-lift cursor-pointer flex flex-col h-full bg-white relative overflow-hidden group border border-slate-200/60"
                    >
                        {/* Status Decorative Top Border */}
                        <div className={`absolute top-0 left-0 right-0 h-1 ${Status.bg.replace('bg-', 'bg-').replace('50', '400')}`} />

                        <div className="flex justify-between items-start mb-3 mt-1 gap-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase ${PRIORITY_STYLES[q.priority!]}`}>
                                {q.priority}
                            </span>
                            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                                {formatDistanceToNow(new Date(q.createdAt))} ago
                            </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {q.title}
                        </h3>

                        <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
                            {q.description}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 w-full mt-auto">
                            <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${Status.bg}`}>
                                    <StatusIcon className={`h-4 w-4 ${Status.color}`} />
                                </div>
                                <span className={`text-xs font-semibold ${Status.color}`}>{Status.label}</span>
                            </div>

                            <div className="flex items-center gap-3 text-slate-400 text-xs font-semibold">
                                {q.attachments?.length > 0 && (
                                    <div className="flex items-center gap-1">
                                        <FileText className="h-4 w-4" />
                                        {q.attachments.length}
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <MessageCircle className="h-4 w-4" />
                                    {q.responses?.length || 0}
                                </div>
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}

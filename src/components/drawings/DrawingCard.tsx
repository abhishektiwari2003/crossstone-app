"use client";

import { useState } from "react";
import { FileText, Download, Eye, CheckCircle2, Clock, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import DrawingApprovalButton from "@/components/drawings/DrawingApprovalButton";
import RevokeApprovalDialog from "@/components/drawings/RevokeApprovalDialog";
import DeleteDrawingButton from "@/components/drawings/DeleteDrawingButton";
import DrawingActivityLog from "@/components/drawings/DrawingActivityLog";
import type { Drawing, DrawingStatus, UserRole } from "@/types/drawings";
import { getDrawingStatus, canApproveDrawing } from "@/types/drawings";

type Props = {
    drawing: Drawing;
    allDrawings: Drawing[];
    userRole: UserRole;
    onRefresh: () => void;
};

const STATUS_CONFIG: Record<DrawingStatus, { label: string; icon: React.ReactNode; className: string }> = {
    approved: {
        label: "Approved",
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
        className: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
    pending: {
        label: "Pending Approval",
        icon: <Clock className="h-3.5 w-3.5" />,
        className: "text-amber-700 bg-amber-50 border-amber-200",
    },
    superseded: {
        label: "Superseded",
        icon: <AlertTriangle className="h-3.5 w-3.5" />,
        className: "text-slate-500 bg-slate-50 border-slate-200",
    },
};

export default function DrawingCard({ drawing, allDrawings, userRole, onRefresh }: Props) {
    const [expanded, setExpanded] = useState(false);

    const status = getDrawingStatus(drawing, allDrawings);
    const isApproved = !!drawing.approvedAt;
    const isAdminRole = canApproveDrawing(userRole);
    const extension = drawing.url?.split(".").pop()?.toUpperCase() || "FILE";
    const fileName = drawing.url?.split("/").pop() || "Drawing";
    const date = new Date(drawing.createdAt).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
    });
    const statusCfg = STATUS_CONFIG[status];

    return (
        <div className={`glass-card overflow-hidden hover-lift group transition-all ${status === "superseded" ? "opacity-60" : ""}`}>
            {/* File icon header */}
            <div className={`px-5 py-4 flex items-center gap-3 border-b border-slate-100 ${isApproved ? "bg-emerald-50/30" : ""}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${extension === "PDF" ? "bg-red-100 text-red-600" :
                    extension === "DWG" || extension === "DXF" ? "bg-blue-100 text-blue-600" :
                        "bg-orange-100 text-orange-600"
                    }`}>
                    <FileText className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{fileName}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            v{drawing.version || 1}
                        </span>
                        <span className="text-[11px] text-slate-400">{extension}</span>
                    </div>
                </div>
            </div>

            {/* Status + details */}
            <div className="px-5 py-3 space-y-2">
                {/* Status badge */}
                <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border ${statusCfg.className}`}>
                    {statusCfg.icon}
                    <span className="font-semibold">{statusCfg.label}</span>
                    {drawing.approvedAt && (
                        <span className="ml-auto opacity-70">
                            {new Date(drawing.approvedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                    )}
                </div>

                {/* Uploaded by */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="truncate">{drawing.uploadedBy?.name || "Unknown"}</span>
                    <span className="text-slate-300">·</span>
                    <span className="shrink-0">{date}</span>
                </div>

                {/* Expandable activity log */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors pt-1"
                >
                    {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    Activity
                </button>
                {expanded && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                        <DrawingActivityLog drawing={drawing} />
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="px-5 py-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <a
                        href={drawing.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 text-slate-700 px-3 py-2 text-xs font-semibold hover:bg-slate-200 transition-colors"
                    >
                        <Eye className="h-3.5 w-3.5" />
                        View
                    </a>
                    <a
                        href={drawing.url}
                        download
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 px-3 py-2 text-xs font-semibold hover:bg-blue-100 transition-colors"
                    >
                        <Download className="h-3.5 w-3.5" />
                        Download
                    </a>
                </div>

                {/* Admin actions */}
                {isAdminRole && (
                    <div className="flex items-center gap-2">
                        {!isApproved && status !== "superseded" && (
                            <DrawingApprovalButton drawingId={drawing.id} onSuccess={onRefresh} />
                        )}
                        {isApproved && (
                            <RevokeApprovalDialog drawingId={drawing.id} onSuccess={onRefresh} />
                        )}
                        <DeleteDrawingButton drawing={drawing} userRole={userRole} onSuccess={onRefresh} />
                    </div>
                )}
            </div>
        </div>
    );
}

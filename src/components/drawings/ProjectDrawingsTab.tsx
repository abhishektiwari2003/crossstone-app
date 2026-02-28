"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { FileText, Layers } from "lucide-react";
import DrawingUploadForm from "@/components/drawings/DrawingUploadForm";
import DrawingCard from "@/components/drawings/DrawingCard";
import DrawingApprovalButton from "@/components/drawings/DrawingApprovalButton";
import type { Drawing, UserRole } from "@/types/drawings";
import { getDrawingStatus, canApproveDrawing } from "@/types/drawings";

type Props = {
    projectId: string;
    userRole: UserRole;
};

export default function ProjectDrawingsTab({ projectId, userRole }: Props) {
    const [drawings, setDrawings] = useState<Drawing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [view, setView] = useState<"grid" | "versions">("grid");

    const isAdmin = canApproveDrawing(userRole);

    const fetchDrawings = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await fetch(`/api/projects/${projectId}/drawings`);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setDrawings(data.drawings || []);
        } catch {
            setError(true);
            toast.error("Failed to load drawings");
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => { fetchDrawings(); }, [fetchDrawings]);

    // Group by filename base for version history
    function getVersionGroups(): Record<string, Drawing[]> {
        const groups: Record<string, Drawing[]> = {};
        for (const d of drawings) {
            const base = d.url?.split("/").pop()?.replace(/\.[^.]+$/, "") || "drawing";
            if (!groups[base]) groups[base] = [];
            groups[base].push(d);
        }
        for (const key of Object.keys(groups)) {
            groups[key].sort((a, b) => (b.version || 0) - (a.version || 0));
        }
        return groups;
    }

    // Loading skeleton
    if (loading) {
        return (
            <div className="space-y-4">
                {isAdmin && (
                    <div className="glass-card p-6 space-y-4">
                        <div className="h-5 w-36 rounded shimmer" />
                        <div className="h-32 rounded-xl shimmer" />
                    </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="glass-card p-5 space-y-3">
                            <div className="h-12 w-12 rounded-xl shimmer" />
                            <div className="h-4 w-32 rounded shimmer" />
                            <div className="h-3 w-20 rounded shimmer" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="glass-card p-8 text-center">
                <FileText className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                <p className="text-sm text-slate-500 mb-3">Failed to load drawings.</p>
                <button onClick={fetchDrawings} className="text-sm font-medium text-blue-600 hover:text-blue-700">Try again</button>
            </div>
        );
    }

    const versionGroups = getVersionGroups();

    return (
        <div className="space-y-6">
            {/* Admin upload form */}
            {isAdmin && <DrawingUploadForm projectId={projectId} onSuccess={fetchDrawings} />}

            {/* View toggle + count */}
            {drawings.length > 0 && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-orange-600" />
                        <h3 className="text-base font-semibold text-slate-900">Drawings</h3>
                        <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{drawings.length}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                        <button
                            onClick={() => setView("grid")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === "grid" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}
                        >
                            Grid
                        </button>
                        <button
                            onClick={() => setView("versions")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === "versions" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}
                        >
                            <Layers className="h-3.5 w-3.5 inline mr-1" />
                            Versions
                        </button>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {drawings.length === 0 && (
                <div className="glass-card p-10 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-orange-400" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 mb-1">No drawings uploaded yet</h3>
                    <p className="text-sm text-slate-500">
                        {isAdmin ? "Upload drawings to share with the project team." : "No drawings have been uploaded for this project yet."}
                    </p>
                </div>
            )}

            {/* Grid view */}
            {view === "grid" && drawings.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {drawings.map(d => (
                        <DrawingCard
                            key={d.id}
                            drawing={d}
                            allDrawings={drawings}
                            userRole={userRole}
                            onRefresh={fetchDrawings}
                        />
                    ))}
                </div>
            )}

            {/* Version history view */}
            {view === "versions" && drawings.length > 0 && (
                <div className="space-y-6">
                    {Object.entries(versionGroups).map(([group, versions]) => (
                        <div key={group} className="glass-card overflow-hidden">
                            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                                <Layers className="h-4 w-4 text-slate-500" />
                                <span className="text-sm font-semibold text-slate-700">{group}</span>
                                <span className="text-xs text-slate-400">{versions.length} version{versions.length > 1 ? "s" : ""}</span>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {versions.map((d, idx) => {
                                    const isLatest = idx === 0;
                                    const isApproved = !!d.approvedAt;
                                    const status = getDrawingStatus(d, drawings);
                                    const date = new Date(d.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

                                    return (
                                        <div key={d.id} className={`px-5 py-4 flex items-center gap-3 ${isLatest ? "bg-orange-50/30" : ""} ${status === "superseded" ? "opacity-50" : ""}`}>
                                            {/* Timeline dot */}
                                            <div className="flex flex-col items-center shrink-0">
                                                <div className={`w-3 h-3 rounded-full border-2 ${isApproved ? "bg-emerald-500 border-emerald-500" :
                                                        isLatest ? "bg-orange-500 border-orange-500" :
                                                            "bg-slate-300 border-slate-300"
                                                    }`} />
                                                {idx < versions.length - 1 && (
                                                    <div className="w-0.5 h-6 bg-slate-200 mt-1" />
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                                                        v{d.version || 1}
                                                    </span>
                                                    {isLatest && (
                                                        <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">LATEST</span>
                                                    )}
                                                    {status === "approved" && (
                                                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">APPROVED</span>
                                                    )}
                                                    {status === "superseded" && (
                                                        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">SUPERSEDED</span>
                                                    )}
                                                    {status === "pending" && (
                                                        <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">PENDING</span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-400 mt-1">
                                                    {d.uploadedBy?.name || "Unknown"} · {date}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 shrink-0">
                                                <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 font-semibold hover:text-blue-700">View</a>
                                                {isAdmin && !isApproved && status !== "superseded" && (
                                                    <DrawingApprovalButton drawingId={d.id} onSuccess={fetchDrawings} />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

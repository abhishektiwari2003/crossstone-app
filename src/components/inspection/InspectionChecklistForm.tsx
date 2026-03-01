"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, ClipboardCheck, CheckCircle2, XCircle, MinusCircle, AlertCircle } from "lucide-react";
import { useInspectionDraft } from "@/hooks/useInspectionDraft";
import InspectionPhotoUpload from "@/components/inspection/InspectionPhotoUpload";
import SubmitInspectionDialog from "@/components/inspection/SubmitInspectionDialog";
import type { Milestone, ChecklistItem, ChecklistResult, InspectionResponse } from "@/types/inspections";

type Props = {
    projectId: string;
    milestoneId: string;
};

const resultOptions: { value: ChecklistResult; label: string; icon: typeof CheckCircle2; color: string; bg: string }[] = [
    { value: "PASS", label: "Pass", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-300 hover:bg-emerald-100" },
    { value: "FAIL", label: "Fail", icon: XCircle, color: "text-red-600", bg: "bg-red-50 border-red-300 hover:bg-red-100" },
    { value: "NA", label: "N/A", icon: MinusCircle, color: "text-slate-500", bg: "bg-slate-50 border-slate-300 hover:bg-slate-100" },
];

export default function InspectionChecklistForm({ projectId, milestoneId }: Props) {
    const [milestone, setMilestone] = useState<Milestone | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [showSubmit, setShowSubmit] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const { draft, updateResponse, clearDraft, hasDraft } = useInspectionDraft(projectId, milestoneId);

    const fetchMilestone = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await fetch(`/api/projects/${projectId}/milestones`);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            const ms = (data.milestones || []).find((m: Milestone) => m.id === milestoneId);
            if (!ms) throw new Error("Milestone not found");
            setMilestone(ms);
        } catch {
            setError(true);
            toast.error("Failed to load checklist");
        } finally {
            setLoading(false);
        }
    }, [projectId, milestoneId]);

    useEffect(() => { fetchMilestone(); }, [fetchMilestone]);

    function isFormValid(): boolean {
        if (!milestone) return false;
        return milestone.checklistItems.every(item => {
            if (!item.isRequired) return true;
            const resp = draft.responses[item.id];
            if (!resp?.result) return false;
            if (item.isPhotoRequired && (!resp.mediaIds || resp.mediaIds.length === 0)) return false;
            return true;
        });
    }

    function buildResponses(): InspectionResponse[] {
        if (!milestone) return [];
        return milestone.checklistItems.map(item => {
            const resp = draft.responses[item.id] || { result: null, remark: "", mediaIds: [] };
            return {
                checklistItemId: item.id,
                result: resp.result || "NA",
                remark: resp.remark || undefined,
                mediaIds: resp.mediaIds || [],
            };
        });
    }

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto space-y-4">
                <div className="h-6 w-32 rounded shimmer" />
                <div className="glass-card p-6 space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="space-y-2">
                            <div className="h-4 w-48 rounded shimmer" />
                            <div className="h-12 w-full rounded-xl shimmer" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error || !milestone) {
        return (
            <div className="max-w-2xl mx-auto text-center py-12">
                <AlertCircle className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                <p className="text-sm text-slate-500 mb-3">Failed to load inspection checklist.</p>
                <button onClick={fetchMilestone} className="text-sm font-medium text-blue-600 hover:text-blue-700">Try again</button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <Link href={`/projects/${projectId}/inspections`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-4">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Inspections
                </Link>
                <div className="glass-card overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 px-5 py-5 sm:px-6 sm:py-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                <ClipboardCheck className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg sm:text-xl font-bold text-white">{milestone.name}</h1>
                                <p className="text-orange-100 text-xs sm:text-sm">{milestone.checklistItems.length} checklist items</p>
                            </div>
                        </div>
                    </div>
                    {hasDraft && !submitted && (
                        <div className="px-5 py-3 bg-blue-50 border-b border-blue-200 text-xs text-blue-700 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            Draft restored — your progress was auto-saved.
                        </div>
                    )}
                </div>
            </div>

            {submitted && (
                <div className="glass-card p-6 text-center">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Inspection Submitted</h3>
                    <p className="text-sm text-slate-500">This inspection has been locked and submitted for review.</p>
                </div>
            )}

            {!submitted && (
                <div className="space-y-4">
                    {milestone.checklistItems
                        .sort((a, b) => a.order - b.order)
                        .map((item, index) => (
                            <ChecklistItemCard
                                key={item.id}
                                item={item}
                                index={index}
                                projectId={projectId}
                                response={draft.responses[item.id] || { result: null, remark: "", mediaIds: [] }}
                                onUpdate={(field, value) => updateResponse(item.id, field, value)}
                            />
                        ))}

                    <div className="glass-card p-5">
                        <button
                            onClick={() => setShowSubmit(true)}
                            disabled={!isFormValid()}
                            className="w-full rounded-xl gradient-orange text-white py-3.5 text-sm sm:text-base font-bold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Submit Inspection
                        </button>
                        {!isFormValid() && (
                            <p className="text-xs text-slate-400 text-center mt-2">Complete all required items (*) before submitting.</p>
                        )}
                    </div>
                </div>
            )}

            <SubmitInspectionDialog
                open={showSubmit}
                onOpenChange={setShowSubmit}
                projectId={projectId}
                milestoneId={milestoneId}
                responses={buildResponses()}
                onSuccess={() => { clearDraft(); setSubmitted(true); }}
            />
        </div>
    );
}

function ChecklistItemCard({
    item, index, projectId, response, onUpdate,
}: {
    item: ChecklistItem;
    index: number;
    projectId: string;
    response: { result: ChecklistResult | null; remark: string; mediaIds: string[] };
    onUpdate: (field: "result" | "remark" | "mediaIds", value: ChecklistResult | null | string | string[]) => void;
}) {
    return (
        <div className="glass-card p-4 sm:p-5 space-y-4">
            <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0 mt-0.5">
                    {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 text-sm sm:text-base">
                        {item.title}
                        {item.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        {item.isRequired && <span className="bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-medium">Required</span>}
                        {item.isPhotoRequired && <span className="bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-medium">📷 Photo Required</span>}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
                {resultOptions.map(opt => {
                    const Icon = opt.icon;
                    const selected = response.result === opt.value;
                    return (
                        <button
                            key={opt.value}
                            onClick={() => onUpdate("result", opt.value)}
                            className={`flex items-center justify-center gap-1.5 py-3 sm:py-2.5 rounded-xl border-2 text-sm font-semibold transition-all touch-manipulation
                ${selected
                                    ? `${opt.bg} border-current ${opt.color} ring-2 ring-current/20 scale-[1.02]`
                                    : "border-slate-200 text-slate-500 hover:border-slate-300 bg-white"
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            <span>{opt.label}</span>
                        </button>
                    );
                })}
            </div>

            <textarea
                value={response.remark}
                onChange={e => onUpdate("remark", e.target.value)}
                placeholder="Add remarks (optional)..."
                rows={2}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white/60 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none transition-all resize-none"
            />

            <InspectionPhotoUpload
                projectId={projectId}
                mediaIds={response.mediaIds || []}
                onChange={ids => onUpdate("mediaIds", ids)}
            />
        </div>
    );
}

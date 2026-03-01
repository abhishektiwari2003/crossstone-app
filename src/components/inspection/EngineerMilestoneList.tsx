"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { ClipboardCheck, ChevronRight, History, ListTodo } from "lucide-react";
import type { Milestone, Inspection } from "@/types/inspections";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InspectionHistory from "./InspectionHistory";

type Props = {
    projectId: string;
};

function getStatusInfo(milestone: Milestone, inspections: Inspection[]) {
    const inspection = inspections.find(i => i.milestoneId === milestone.id);
    if (!inspection) return { label: "Not Started", color: "bg-slate-100 text-slate-600 border-slate-200" };
    if (inspection.status === "REVIEWED") return { label: "Completed", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    if (inspection.status === "SUBMITTED") return { label: "Submitted", color: "bg-blue-50 text-blue-700 border-blue-200" };
    return { label: "In Progress", color: "bg-amber-50 text-amber-700 border-amber-200" };
}

export default function EngineerMilestoneList({ projectId }: Props) {
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [inspections, setInspections] = useState<Inspection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const [mRes, iRes] = await Promise.all([
                fetch(`/api/projects/${projectId}/milestones`),
                fetch(`/api/projects/${projectId}/inspections`),
            ]);
            if (mRes.ok) {
                const mData = await mRes.json();
                setMilestones((mData.milestones || []).filter((m: Milestone) => m.isActive));
            }
            if (iRes.ok) {
                const iData = await iRes.json();
                setInspections(iData.inspections || iData || []);
            }
        } catch {
            setError(true);
            toast.error("Failed to load milestones");
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="glass-card p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl shimmer" />
                        <div className="flex-1 space-y-2">
                            <div className="h-5 w-40 rounded shimmer" />
                            <div className="h-3 w-24 rounded shimmer" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-card p-8 text-center">
                <ClipboardCheck className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                <p className="text-sm text-slate-500 mb-3">Failed to load milestones.</p>
                <button onClick={fetchData} className="text-sm font-medium text-blue-600 hover:text-blue-700">Try again</button>
            </div>
        );
    }

    if (milestones.length === 0) {
        return (
            <div className="glass-card p-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
                    <ClipboardCheck className="h-8 w-8 text-orange-400" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">No inspections available</h3>
                <p className="text-sm text-slate-500">No milestones have been assigned to this project yet.</p>
            </div>
        );
    }

    const historyItems = inspections.filter(i => i.status !== "DRAFT").map(i => ({
        id: i.id,
        milestoneName: i.milestone?.name || "Unknown Milestone",
        status: i.status,
        submittedAt: i.createdAt,
        engineerName: i.engineer?.name,
        mediaCount: i.responses?.reduce((acc, r: any) => acc + (r.mediaFiles?.length || (r.mediaId ? 1 : 0)), 0),
        resultSummary: i.responses?.reduce((acc, r: any) => {
            if (r.result === "PASS") acc.pass++;
            else if (r.result === "FAIL") acc.fail++;
            else acc.na++;
            return acc;
        }, { pass: 0, fail: 0, na: 0 }) || { pass: 0, fail: 0, na: 0 }
    }));

    return (
        <Tabs defaultValue="active" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-orange-600" />
                    <h2 className="text-lg font-bold text-slate-900">Site Inspections</h2>
                </div>
                <TabsList className="bg-slate-100/50 p-1 backdrop-blur-md border border-slate-200 shadow-inner w-full sm:w-auto h-auto rounded-xl">
                    <TabsTrigger value="active" className="flex-1 sm:flex-none gap-2 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm rounded-lg py-2">
                        <ListTodo className="h-4 w-4" /> Checklist
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex-1 sm:flex-none gap-2 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm rounded-lg py-2">
                        <History className="h-4 w-4" /> History
                    </TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="active" className="mt-0 focus-visible:outline-none">
                <div className="space-y-3">
                    {milestones.sort((a, b) => a.order - b.order).map(milestone => {
                        const status = getStatusInfo(milestone, inspections);
                        const isCompleted = status.label === "Completed" || status.label === "Submitted";

                        return (
                            <Link key={milestone.id} href={`/projects/${projectId}/inspections/${milestone.id}`} className="block">
                                <div className="glass-card p-4 sm:p-5 hover-lift group flex items-center gap-4 border-l-4 border-l-transparent hover:border-l-orange-500 transition-all">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl gradient-orange flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg shadow-orange-500/20">
                                        {milestone.order + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-slate-900 text-sm sm:text-base truncate">{milestone.name}</div>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] uppercase tracking-wider font-bold border ${status.color}`}>
                                                {status.label}
                                            </span>
                                            <span className="text-xs font-semibold text-slate-400">{milestone.checklistItems?.length || 0} tasks</span>
                                        </div>
                                    </div>
                                    <div className="shrink-0">
                                        {isCompleted ? (
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Locked</span>
                                        ) : (
                                            <div className="flex items-center gap-1 text-sm font-bold text-orange-600 group-hover:text-orange-700 transition-colors">
                                                <span className="hidden sm:inline uppercase tracking-widest text-[10px]">{status.label === "Not Started" ? "Start" : "Resume"}</span>
                                                <ChevronRight className="h-5 w-5" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </TabsContent>

            <TabsContent value="history" className="mt-0 focus-visible:outline-none">
                <InspectionHistory projectId={projectId} inspections={historyItems as any[]} />
            </TabsContent>
        </Tabs>
    );
}

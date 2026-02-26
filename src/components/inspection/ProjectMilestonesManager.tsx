"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus, Loader2, ClipboardList, Milestone as MilestoneIcon } from "lucide-react";
import MilestoneCard from "@/components/inspection/MilestoneCard";
import type { Milestone } from "@/types/inspections";

type Props = {
    projectId: string;
};

export default function ProjectMilestonesManager({ projectId }: Props) {
    const router = useRouter();
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [newName, setNewName] = useState("");
    const [adding, setAdding] = useState(false);
    const [showAdd, setShowAdd] = useState(false);

    const fetchMilestones = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await fetch(`/api/projects/${projectId}/milestones`);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setMilestones(data.milestones || []);
        } catch {
            setError(true);
            toast.error("Failed to load milestones");
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => { fetchMilestones(); }, [fetchMilestones]);

    async function handleCreate() {
        if (!newName.trim()) return;
        setAdding(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/milestones`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName.trim(), order: milestones.length }),
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({ error: "Failed" }));
                throw new Error(errData.error || "Failed to create");
            }
            toast.success("Milestone created");
            setNewName("");
            setShowAdd(false);
            router.refresh();
            fetchMilestones();
        } catch (err: unknown) {
            toast.error((err as Error).message);
        } finally {
            setAdding(false);
        }
    }

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="glass-card p-5 flex items-center gap-4">
                        <div className="w-5 h-10 rounded shimmer" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-40 rounded shimmer" />
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
                <ClipboardList className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                <p className="text-sm text-slate-500 mb-3">Failed to load milestones.</p>
                <button onClick={fetchMilestones} className="text-sm font-medium text-blue-600 hover:text-blue-700">Try again</button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MilestoneIcon className="h-5 w-5 text-orange-600" />
                    <h2 className="text-lg font-semibold text-slate-900">Milestones</h2>
                    <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{milestones.length}</span>
                </div>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="rounded-xl gradient-orange border-0 text-white font-semibold gap-1.5 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:brightness-110 transition-all inline-flex items-center px-4 py-2.5 text-sm"
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Milestone</span>
                    <span className="sm:hidden">Add</span>
                </button>
            </div>

            {showAdd && (
                <div className="glass-card p-4 sm:p-5 flex flex-col sm:flex-row gap-3">
                    <input
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        placeholder="e.g. Foundation Inspection"
                        className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white/60 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none transition-all"
                        autoFocus
                        onKeyDown={e => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setShowAdd(false); }}
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handleCreate}
                            disabled={adding || !newName.trim()}
                            className="rounded-xl gradient-orange text-white px-5 py-2.5 text-sm font-semibold shadow-lg shadow-orange-500/20 disabled:opacity-50 transition-all flex-1 sm:flex-none"
                        >
                            {adding ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Create"}
                        </button>
                        <button
                            onClick={() => { setShowAdd(false); setNewName(""); }}
                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {milestones.length === 0 ? (
                <div className="glass-card p-10 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
                        <ClipboardList className="h-8 w-8 text-orange-400" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 mb-1">No milestones yet</h3>
                    <p className="text-sm text-slate-500 mb-4">Create milestones to define inspection checkpoints for this project.</p>
                    <button
                        onClick={() => setShowAdd(true)}
                        className="inline-flex items-center gap-2 rounded-xl gradient-orange text-white px-5 py-2.5 text-sm font-semibold shadow-lg shadow-orange-500/20"
                    >
                        <Plus className="h-4 w-4" />
                        Create First Milestone
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {milestones.sort((a, b) => a.order - b.order).map(m => (
                        <MilestoneCard key={m.id} milestone={m} projectId={projectId} />
                    ))}
                </div>
            )}
        </div>
    );
}

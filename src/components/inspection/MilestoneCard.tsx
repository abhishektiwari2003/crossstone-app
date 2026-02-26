"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { GripVertical, Edit3, Trash2, ChevronDown, ChevronUp, ToggleLeft, ToggleRight, Loader2, AlertTriangle } from "lucide-react";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Milestone } from "@/types/inspections";
import ChecklistBuilder from "@/components/inspection/ChecklistBuilder";

type Props = {
    milestone: Milestone;
    projectId: string;
};

export default function MilestoneCard({ milestone, projectId }: Props) {
    const router = useRouter();
    const [expanded, setExpanded] = useState(false);
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(milestone.name);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [toggling, setToggling] = useState(false);

    async function handleSaveName() {
        if (!name.trim() || name === milestone.name) {
            setEditing(false);
            setName(milestone.name);
            return;
        }
        setSaving(true);
        try {
            const res = await fetch(`/api/milestones/${milestone.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name.trim() }),
            });
            if (!res.ok) throw new Error("Failed to update");
            toast.success("Milestone updated");
            setEditing(false);
            router.refresh();
        } catch {
            toast.error("Failed to update milestone");
        } finally {
            setSaving(false);
        }
    }

    async function handleToggleActive() {
        setToggling(true);
        try {
            const res = await fetch(`/api/milestones/${milestone.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !milestone.isActive }),
            });
            if (!res.ok) throw new Error("Failed to toggle");
            toast.success(milestone.isActive ? "Milestone deactivated" : "Milestone activated");
            router.refresh();
        } catch {
            toast.error("Failed to toggle milestone");
        } finally {
            setToggling(false);
        }
    }

    async function handleDelete() {
        setDeleting(true);
        try {
            const res = await fetch(`/api/milestones/${milestone.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            toast.success("Milestone deleted");
            router.refresh();
        } catch {
            toast.error("Failed to delete milestone");
        } finally {
            setDeleting(false);
        }
    }

    return (
        <div className={`glass-card overflow-hidden transition-all ${!milestone.isActive ? "opacity-60" : ""}`}>
            <div className="p-4 sm:p-5 flex items-center gap-3">
                <div className="cursor-grab text-slate-400 hover:text-slate-600 transition-colors shrink-0 touch-manipulation">
                    <GripVertical className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0">
                    {editing ? (
                        <div className="flex items-center gap-2">
                            <input
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="flex-1 rounded-lg border border-blue-300 px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-blue-400/30 outline-none bg-white"
                                autoFocus
                                onKeyDown={e => {
                                    if (e.key === "Enter") handleSaveName();
                                    if (e.key === "Escape") { setEditing(false); setName(milestone.name); }
                                }}
                            />
                            <button onClick={handleSaveName} disabled={saving} className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors">
                                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 text-sm sm:text-base truncate">{milestone.name}</span>
                            <span className="text-[10px] font-medium text-slate-400 shrink-0">#{milestone.order}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <button onClick={handleToggleActive} disabled={toggling} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all" title={milestone.isActive ? "Deactivate" : "Activate"}>
                        {milestone.isActive ? <ToggleRight className="h-5 w-5 text-emerald-500" /> : <ToggleLeft className="h-5 w-5" />}
                    </button>
                    <button onClick={() => setEditing(!editing)} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                        <Edit3 className="h-4 w-4" />
                    </button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <button className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl max-w-sm">
                            <AlertDialogHeader>
                                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-2">
                                    <AlertTriangle className="h-6 w-6 text-red-500" />
                                </div>
                                <AlertDialogTitle className="text-center">Delete Milestone</AlertDialogTitle>
                                <AlertDialogDescription className="text-center">
                                    Delete <strong>&quot;{milestone.name}&quot;</strong> and all its checklist items? This cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="gap-2 sm:gap-2">
                                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} disabled={deleting} className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold">
                                    {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                                    {deleting ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <button onClick={() => setExpanded(!expanded)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            {expanded && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-5">
                    <ChecklistBuilder milestoneId={milestone.id} projectId={projectId} items={milestone.checklistItems || []} />
                </div>
            )}
        </div>
    );
}

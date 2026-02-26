"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Plus, Trash2, GripVertical, Loader2, Camera, AlertCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { ChecklistItem } from "@/types/inspections";

type Props = {
    milestoneId: string;
    projectId: string;
    items: ChecklistItem[];
};

export default function ChecklistBuilder({ milestoneId, items }: Props) {
    const router = useRouter();
    const [newTitle, setNewTitle] = useState("");
    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    async function handleAdd() {
        if (!newTitle.trim()) return;
        setAdding(true);
        try {
            const res = await fetch(`/api/milestones/${milestoneId}/checklist`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newTitle.trim(),
                    isRequired: true,
                    isPhotoRequired: false,
                    order: items.length,
                }),
            });
            if (!res.ok) throw new Error("Failed to add");
            toast.success("Checklist item added");
            setNewTitle("");
            router.refresh();
        } catch {
            toast.error("Failed to add checklist item");
        } finally {
            setAdding(false);
        }
    }

    async function handleUpdateTitle(itemId: string) {
        if (!editTitle.trim()) { setEditingId(null); return; }
        try {
            const res = await fetch(`/api/checklist/${itemId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: editTitle.trim() }),
            });
            if (!res.ok) throw new Error("Failed to update");
            toast.success("Updated");
            setEditingId(null);
            router.refresh();
        } catch {
            toast.error("Failed to update item");
        }
    }

    async function handleToggle(itemId: string, field: "isRequired" | "isPhotoRequired", value: boolean) {
        setTogglingId(itemId);
        try {
            const res = await fetch(`/api/checklist/${itemId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [field]: value }),
            });
            if (!res.ok) throw new Error("Failed to update");
            router.refresh();
        } catch {
            toast.error("Failed to update");
        } finally {
            setTogglingId(null);
        }
    }

    async function handleDelete(itemId: string) {
        setDeletingId(itemId);
        try {
            const res = await fetch(`/api/checklist/${itemId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            toast.success("Item removed");
            router.refresh();
        } catch {
            toast.error("Failed to delete item");
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Checklist Items</h4>

            {items.length === 0 ? (
                <div className="text-center py-6 text-sm text-slate-400">
                    <AlertCircle className="h-5 w-5 mx-auto mb-2 text-slate-300" />
                    No checklist items yet. Add one below.
                </div>
            ) : (
                <div className="space-y-2">
                    {items.map(item => (
                        <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <GripVertical className="h-4 w-4 text-slate-300 cursor-grab shrink-0" />
                                {editingId === item.id ? (
                                    <input
                                        value={editTitle}
                                        onChange={e => setEditTitle(e.target.value)}
                                        className="flex-1 rounded-lg border border-blue-300 px-2.5 py-1 text-sm focus:ring-2 focus:ring-blue-400/30 outline-none"
                                        autoFocus
                                        onKeyDown={e => {
                                            if (e.key === "Enter") handleUpdateTitle(item.id);
                                            if (e.key === "Escape") setEditingId(null);
                                        }}
                                    />
                                ) : (
                                    <button
                                        onClick={() => { setEditingId(item.id); setEditTitle(item.title); }}
                                        className="text-sm text-slate-800 font-medium truncate text-left hover:text-blue-600 transition-colors"
                                    >
                                        {item.title}
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-3 sm:gap-4 shrink-0 pl-6 sm:pl-0">
                                <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                                    <Switch
                                        checked={item.isRequired}
                                        onCheckedChange={v => handleToggle(item.id, "isRequired", v)}
                                        disabled={togglingId === item.id}
                                        className="scale-75"
                                    />
                                    <span className="hidden sm:inline">Required</span>
                                    <span className="sm:hidden">Req</span>
                                </label>

                                <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                                    <Switch
                                        checked={item.isPhotoRequired}
                                        onCheckedChange={v => handleToggle(item.id, "isPhotoRequired", v)}
                                        disabled={togglingId === item.id}
                                        className="scale-75"
                                    />
                                    <Camera className="h-3.5 w-3.5" />
                                </label>

                                <button
                                    onClick={() => handleDelete(item.id)}
                                    disabled={deletingId === item.id}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                >
                                    {deletingId === item.id
                                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        : <Trash2 className="h-3.5 w-3.5" />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-2">
                <input
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="New checklist item..."
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none transition-all"
                    onKeyDown={e => { if (e.key === "Enter") handleAdd(); }}
                />
                <button
                    onClick={handleAdd}
                    disabled={adding || !newTitle.trim()}
                    className="rounded-xl gradient-orange px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:brightness-110 transition-all disabled:opacity-50 shrink-0"
                >
                    {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </button>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import type { Drawing, UserRole } from "@/types/drawings";
import { canDeleteDrawing } from "@/types/drawings";

type Props = {
    drawing: Drawing;
    userRole: UserRole;
    onSuccess: () => void;
};

export default function DeleteDrawingButton({ drawing, userRole, onSuccess }: Props) {
    const [confirming, setConfirming] = useState(false);
    const [loading, setLoading] = useState(false);

    const allowed = canDeleteDrawing(userRole, drawing);
    const isApproved = !!drawing.approvedAt;

    if (!allowed) {
        return (
            <div className="relative group">
                <button
                    disabled
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-300 px-3 py-1.5 text-xs font-semibold cursor-not-allowed"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    <div className="bg-slate-900 text-white text-[10px] font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                        {isApproved ? "Only Super Admin can delete approved drawings" : "Admin access required"}
                    </div>
                </div>
            </div>
        );
    }

    async function handleDelete() {
        setLoading(true);
        try {
            const res = await fetch(`/api/drawings/${drawing.id}`, { method: "DELETE" });
            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: "Failed" }));
                throw new Error(err.error || "Failed to delete");
            }
            toast.success("Drawing deleted");
            setConfirming(false);
            onSuccess();
        } catch (err: unknown) {
            toast.error((err as Error).message);
        } finally {
            setLoading(false);
        }
    }

    if (confirming) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                <div className="glass-card max-w-sm w-full p-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Delete Drawing?</h3>
                            <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                        <button
                            onClick={() => setConfirming(false)}
                            disabled={loading}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 text-white px-4 py-2 text-xs font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                            {loading ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={() => setConfirming(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border-2 border-red-200 bg-red-50 text-red-600 px-3 py-1.5 text-xs font-semibold hover:bg-red-100 hover:border-red-300 transition-all"
        >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
        </button>
    );
}

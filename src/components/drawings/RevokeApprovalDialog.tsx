"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, ShieldX, AlertTriangle } from "lucide-react";

type Props = {
    drawingId: string;
    onSuccess: () => void;
};

export default function RevokeApprovalDialog({ drawingId, onSuccess }: Props) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleRevoke() {
        setLoading(true);
        try {
            const res = await fetch(`/api/drawings/${drawingId}/disapprove`, { method: "PATCH" });
            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: "Failed" }));
                throw new Error(err.error || "Failed to revoke approval");
            }
            toast.success("Approval revoked");
            setOpen(false);
            onSuccess();
        } catch (err: unknown) {
            toast.error((err as Error).message);
        } finally {
            setLoading(false);
        }
    }

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border-2 border-red-200 bg-red-50 text-red-700 px-3 py-1.5 text-xs font-semibold hover:bg-red-100 hover:border-red-300 transition-all"
            >
                <ShieldX className="h-3.5 w-3.5" />
                Revoke
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="glass-card max-w-sm w-full p-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">Revoke Approval?</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Engineers may be using this drawing on-site.</p>
                    </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-xs text-amber-800">
                        This will mark the drawing as &quot;Pending Approval&quot; again. Team members will be notified.
                    </p>
                </div>

                <div className="flex items-center gap-2 justify-end">
                    <button
                        onClick={() => setOpen(false)}
                        disabled={loading}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleRevoke}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 text-white px-4 py-2 text-xs font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldX className="h-3.5 w-3.5" />}
                        {loading ? "Revoking..." : "Revoke Approval"}
                    </button>
                </div>
            </div>
        </div>
    );
}

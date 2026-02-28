"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Shield } from "lucide-react";

type Props = {
    drawingId: string;
    onSuccess: () => void;
};

export default function DrawingApprovalButton({ drawingId, onSuccess }: Props) {
    const [loading, setLoading] = useState(false);

    async function handleApprove() {
        setLoading(true);
        try {
            const res = await fetch(`/api/drawings/${drawingId}/approve`, {
                method: "PATCH",
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: "Failed" }));
                throw new Error(err.error || "Approval failed");
            }
            toast.success("Drawing approved");
            onSuccess();
        } catch (err: unknown) {
            toast.error((err as Error).message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleApprove}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border-2 border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-1.5 text-xs font-semibold hover:bg-emerald-100 hover:border-emerald-300 transition-all disabled:opacity-50"
        >
            {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
                <Shield className="h-3.5 w-3.5" />
            )}
            {loading ? "Approving..." : "Approve"}
        </button>
    );
}

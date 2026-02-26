"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Lock, AlertTriangle } from "lucide-react";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { InspectionResponse } from "@/types/inspections";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: string;
    milestoneId: string;
    responses: InspectionResponse[];
    onSuccess: () => void;
};

export default function SubmitInspectionDialog({ open, onOpenChange, projectId, milestoneId, responses, onSuccess }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleSubmit() {
        setLoading(true);
        try {
            const res = await fetch("/api/inspections", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId,
                    milestoneId,
                    status: "SUBMITTED",
                    responses,
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({ error: "Failed to submit" }));
                throw new Error(data.error || "Submission failed");
            }
            toast.success("Inspection submitted successfully!");
            onSuccess();
            router.push(`/projects/${projectId}/inspections`);
        } catch (err: unknown) {
            toast.error((err as Error).message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="rounded-2xl max-w-sm">
                <AlertDialogHeader>
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-2">
                        <Lock className="h-7 w-7 text-amber-600" />
                    </div>
                    <AlertDialogTitle className="text-center text-lg">Submit Inspection</AlertDialogTitle>
                    <AlertDialogDescription className="text-center">
                        <span className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-left text-amber-800 text-xs mt-2">
                            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                            Once submitted, this inspection <strong>cannot be edited</strong>. Make sure all items are completed.
                        </span>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2 sm:gap-2 mt-2">
                    <AlertDialogCancel className="rounded-xl" disabled={loading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleSubmit}
                        disabled={loading}
                        className="rounded-xl gradient-orange text-white font-semibold shadow-lg shadow-orange-500/20"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Lock className="h-4 w-4 mr-1.5" />}
                        {loading ? "Submitting..." : "Submit & Lock"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

"use client";

import { useState } from "react";
import { PaymentStatus } from "@/generated/prisma";
import { Button } from "@/components/ui/button";
import { CheckSquare, Square, Loader2, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { mutate } from "swr"; // To trigger re-fetches

interface Props {
    selectedIds: string[];
    onClearSelection: () => void;
    projectId: string; // Needed to target SWR mutations if required, or we just mutate global
}

export default function BulkPaymentActions({ selectedIds, onClearSelection, projectId }: Props) {
    const [statusToSet, setStatusToSet] = useState<PaymentStatus | "">("");
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (selectedIds.length === 0) return null;

    const handleBulkUpdate = async () => {
        if (!statusToSet) return;

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/payments/bulk", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    paymentIds: selectedIds,
                    status: statusToSet,
                }),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "Failed to bulk update payments");

            toast.success(`Successfully updated ${result.updatedCount} payments`);
            onClearSelection();
            setStatusToSet("");
            setIsConfirmOpen(false);

            // Revalidate SWR caches for this project's payments
            // In a real app we might precisely target the cache keys, but global revalidate works
            mutate(
                (key: any) => typeof key === 'string' && key.includes(`/api/projects/${projectId}/payments`),
                undefined,
                { revalidate: true }
            );

        } catch (err: any) {
            toast.error(err.message || "Bulk update failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Sticky Action Bar */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
                <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl shadow-slate-900/20 flex flex-col md:flex-row items-center gap-4 md:gap-6 border border-slate-700/50 backdrop-blur-md">

                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm">
                            {selectedIds.length}
                        </div>
                        <span className="text-sm font-medium text-slate-300">
                            Payments Selected
                        </span>
                    </div>

                    <div className="h-px w-full md:h-6 md:w-px bg-slate-700"></div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Select
                            value={statusToSet}
                            onValueChange={(val: any) => setStatusToSet(val)}
                        >
                            <SelectTrigger className="w-full md:w-[140px] h-9 rounded-xl bg-slate-800 border-slate-700 text-sm focus:ring-0 focus:ring-offset-0 text-white">
                                <SelectValue placeholder="Change Status" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl bg-slate-800 border-slate-700 text-white">
                                <SelectItem value="PAID">Mark as Paid</SelectItem>
                                <SelectItem value="PENDING">Mark as Pending</SelectItem>
                                <SelectItem value="OVERDUE">Mark as Overdue</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            size="sm"
                            disabled={!statusToSet}
                            onClick={() => setIsConfirmOpen(true)}
                            className="h-9 rounded-xl bg-indigo-500 hover:bg-indigo-600 border-0 text-white px-4"
                        >
                            Update
                        </Button>

                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={onClearSelection}
                            className="h-9 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 px-3"
                        >
                            Cancel
                        </Button>
                    </div>

                </div>
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="rounded-2xl sm:max-w-[400px]">
                    <DialogHeader>
                        <div className="mx-auto w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                            <AlertTriangle className="h-6 w-6 text-amber-500" />
                        </div>
                        <DialogTitle className="text-center text-xl">Confirm Bulk Update</DialogTitle>
                        <DialogDescription className="text-center pt-2">
                            You are about to change the status of <strong>{selectedIds.length}</strong> payments to <strong>{statusToSet}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6 gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setIsConfirmOpen(false)}
                            className="rounded-xl w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleBulkUpdate}
                            disabled={isSubmitting}
                            className="rounded-xl bg-slate-900 border-0 text-white font-semibold w-full sm:w-auto"
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : "Confirm Update"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

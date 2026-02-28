"use client";

import { useState } from "react";
import { useForm as useRHForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CalendarIcon, Plus, Loader2 } from "lucide-react";

import { PaymentStatus } from "@/generated/prisma";
import type { PaymentCategory } from "@/types/payments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

// Form Validation Schema
const paymentSchema = z.object({
    amount: z.number().positive("Amount must be greater than zero"),
    status: z.nativeEnum(PaymentStatus),
    category: z.custom<PaymentCategory>().optional().nullable(),
    invoiceNumber: z.string().max(50).optional().nullable(),
    notes: z.string().max(500).optional().nullable(),
    dueDate: z.string().optional().nullable(),
    paidAt: z.string().optional().nullable(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface Props {
    projectId: string;
    onSuccess?: () => void;
}

export default function EnhancedPaymentForm({ projectId, onSuccess }: Props) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const form = useRHForm<PaymentFormValues>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            amount: 0,
            status: "PENDING",
            category: null,
            invoiceNumber: "",
            notes: "",
            dueDate: "",
            paidAt: "",
        },
    });

    const isSubmitting = form.formState.isSubmitting;

    const onSubmit = async (data: PaymentFormValues) => {
        try {
            // Include currency for legacy support on backend if needed
            const payload = {
                projectId,
                currency: "INR",
                ...data,
            };

            const res = await fetch(`/api/projects/${projectId}/payments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "Failed to save payment");

            const paymentId = result.payment.id;

            // Handle receipt upload immediately if file is selected
            if (file) {
                const presign = await fetch("/api/uploads/presign", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: "receipt",
                        projectId,
                        paymentId,
                        mimeType: file.type,
                        fileSize: file.size
                    }),
                }).then(r => r.json());

                if (!presign?.url) throw new Error("S3 Upload presign failed");

                const put = await fetch(presign.url as string, {
                    method: "PUT",
                    headers: { "Content-Type": file.type },
                    body: file
                });

                if (!put.ok) throw new Error("Failed connecting to Amazon S3");

                await fetch(`/api/payments/${paymentId}/receipts`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        key: presign.key,
                        url: (presign.url as string).split("?")[0],
                        mimeType: file.type,
                        fileSize: file.size
                    }),
                });
            }

            toast.success("Payment recorded successfully");
            setOpen(false);
            form.reset();
            setFile(null);

            if (onSuccess) onSuccess();
            router.refresh();

        } catch (err) {
            toast.error(err instanceof Error ? err.message : "An unexpected error occurred");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="rounded-xl gradient-emerald border-0 text-white font-semibold gap-1.5 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:brightness-110 transition-all px-5 h-10 md:h-11">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Payment</span>
                    <span className="sm:hidden">Add</span>
                </Button>
            </DialogTrigger>

            <DialogContent className="rounded-3xl border-slate-200 shadow-2xl p-0 max-w-lg overflow-hidden sm:max-w-[480px]">
                <div className="bg-slate-50 border-b border-slate-100 px-6 py-5">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-900">
                            Record Payment
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <form id="payment-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        {/* Amount & Invoice */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Amount (₹) *</label>
                                <Input
                                    type="number"
                                    {...form.register("amount", { valueAsNumber: true })}
                                    className={`rounded-xl h-11 ${form.formState.errors.amount ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                />
                                {form.formState.errors.amount && (
                                    <p className="text-xs text-red-500">{form.formState.errors.amount.message}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Invoice Number</label>
                                <Input
                                    placeholder="INV-2026-X"
                                    {...form.register("invoiceNumber")}
                                    className="rounded-xl h-11"
                                />
                            </div>
                        </div>

                        {/* Status & Category */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Status *</label>
                                <Select
                                    value={form.watch("status")}
                                    onValueChange={(val: PaymentStatus) => form.setValue("status", val)}
                                >
                                    <SelectTrigger className="rounded-xl h-11 bg-white">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="PENDING">Pending</SelectItem>
                                        <SelectItem value="PARTIAL">Partial</SelectItem>
                                        <SelectItem value="PAID">Paid</SelectItem>
                                        <SelectItem value="OVERDUE">Overdue</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Category</label>
                                <Select
                                    value={form.watch("category") || ""}
                                    onValueChange={(val: PaymentCategory) => form.setValue("category", val)}
                                >
                                    <SelectTrigger className="rounded-xl h-11 bg-white">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="MATERIAL">Materials</SelectItem>
                                        <SelectItem value="LABOR">Labor</SelectItem>
                                        <SelectItem value="CONTRACTOR">Contractor</SelectItem>
                                        <SelectItem value="OTHER">Other Expense</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                                    <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                                    Due Date
                                </label>
                                <Input
                                    type="date"
                                    {...form.register("dueDate")}
                                    className="rounded-xl h-11 text-slate-600 block w-full"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                                    <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                                    Paid Date
                                </label>
                                <Input
                                    type="date"
                                    {...form.register("paidAt")}
                                    className="rounded-xl h-11 text-slate-600 block w-full"
                                />
                            </div>
                        </div>

                        {/* Receipt Upload */}
                        <div className="space-y-1.5 border border-slate-100 rounded-xl p-4 bg-slate-50">
                            <label className="text-sm font-semibold text-slate-700">Attach Receipt / Voucher</label>
                            <Input
                                type="file"
                                accept="image/*,application/pdf"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="w-full bg-white rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-colors"
                            />
                            <p className="text-xs text-slate-400 mt-1">PNG, JPG or PDF up to 10MB</p>
                        </div>

                        {/* Notes */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Internal Notes</label>
                            <Textarea
                                placeholder="Bank transfer reference, vendor details, etc."
                                {...form.register("notes")}
                                className="rounded-xl min-h-[80px] resize-none border-slate-200"
                            />
                        </div>
                    </form>
                </div>

                <div className="border-t border-slate-100 p-4 bg-white flex justify-end gap-3 rounded-b-3xl">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        className="rounded-xl text-slate-600 font-medium hover:bg-slate-100"
                    >
                        Cancel
                    </Button>
                    <Button
                        form="payment-form"
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-xl gradient-emerald border-0 text-white font-semibold px-6 shadow-md shadow-emerald-500/20"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Payment"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

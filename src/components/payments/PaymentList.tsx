"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CheckSquare, Square, FileText, Download, Building2, User } from "lucide-react";
import { PaymentStatus } from "@/generated/prisma";
import type { AdvancedPayment, PaymentCategory } from "@/types/payments";
import { cn } from "@/lib/utils";
import BulkPaymentActions from "@/components/payments/BulkPaymentActions";

const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
        case "PAID": return "bg-emerald-50 text-emerald-700 border-emerald-200";
        case "PENDING": return "bg-blue-50 text-blue-700 border-blue-200";
        case "OVERDUE": return "bg-red-50 text-red-700 border-red-200";
        case "PARTIAL": return "bg-amber-50 text-amber-700 border-amber-200";
        default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
};

const getCategoryBadge = (category: PaymentCategory | null) => {
    if (!category) return null;
    return (
        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 rounded-md">
            {category}
        </span>
    );
};

interface Props {
    payments: AdvancedPayment[];
    projectId: string;
    canEdit: boolean;
}

export default function PaymentList({ payments, projectId, canEdit }: Props) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const toggleSelection = (id: string) => {
        if (!canEdit) return;
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleAll = () => {
        if (!canEdit) return;
        if (selectedIds.size === payments.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(payments.map(p => p.id)));
    };

    const formatMoney = (amount: number, currency = "INR") => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: currency,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (payments.length === 0) {
        return (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 border-dashed p-12 text-center flex flex-col items-center">
                <FileText className="h-10 w-10 text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-1">No payments found</h3>
                <p className="text-slate-500 text-sm max-w-sm">
                    There are no financial records matching your current filters. Adjust your filters or create a new payment.
                </p>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider font-semibold text-slate-500">
                                {canEdit && (
                                    <th className="p-4 w-12">
                                        <button onClick={toggleAll} className="text-slate-400 hover:text-slate-600 transition-colors">
                                            {selectedIds.size === payments.length ? <CheckSquare className="h-4 w-4 text-indigo-500" /> : <Square className="h-4 w-4" />}
                                        </button>
                                    </th>
                                )}
                                <th className="p-4 font-semibold text-slate-900">Details</th>
                                <th className="p-4 font-semibold text-slate-900">Amount</th>
                                <th className="p-4 font-semibold text-slate-900">Status</th>
                                <th className="p-4 font-semibold text-slate-900">Category</th>
                                <th className="p-4 font-semibold text-slate-900">Date/Time</th>
                                <th className="p-4 font-semibold text-slate-900 text-right">Receipt</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/80">
                            {payments.map((payment) => (
                                <tr
                                    key={payment.id}
                                    className={cn(
                                        "hover:bg-slate-50/80 transition-colors group",
                                        selectedIds.has(payment.id) ? "bg-indigo-50/30" : ""
                                    )}
                                    onClick={() => toggleSelection(payment.id)}
                                >
                                    {canEdit && (
                                        <td className="p-4 align-top" onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => toggleSelection(payment.id)} className="text-slate-400 hover:text-indigo-500 transition-colors mt-2">
                                                {selectedIds.has(payment.id) ? <CheckSquare className="h-4 w-4 text-indigo-500" /> : <Square className="h-4 w-4" />}
                                            </button>
                                        </td>
                                    )}
                                    <td className="p-4 align-top">
                                        <div className="font-semibold text-slate-900 flex items-center gap-2">
                                            {payment.invoiceNumber || "Uninvoiced"}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1 truncate max-w-[200px]">
                                            {payment.notes || "No additional notes"}
                                        </div>
                                        {/* {(payment as any).createdBy && (
                                            <div className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
                                                <User className="h-3 w-3" />
                                                {(payment as any).createdBy}
                                            </div>
                                        )} */}
                                    </td>
                                    <td className="p-4 align-top">
                                        <div className="font-extrabold text-slate-900 text-[15px]">
                                            {formatMoney(payment.amount, payment.currency)}
                                        </div>
                                    </td>
                                    <td className="p-4 align-top">
                                        <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold border flex w-fit items-center gap-1.5", getStatusColor(payment.status))}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75"></span>
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td className="p-4 align-top">
                                        {getCategoryBadge(payment.category)}
                                    </td>
                                    <td className="p-4 align-top text-sm">
                                        <div className="text-slate-700 font-medium whitespace-nowrap">
                                            {format(new Date(payment.createdAt), "MMM d, yyyy")}
                                        </div>
                                        {payment.paidAt && (
                                            <div className="text-xs text-slate-500 mt-1">
                                                Paid: {format(new Date(payment.paidAt), "MMM d")}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 align-top text-right">
                                        {payment.assets?.length > 0 ? (
                                            <a
                                                href={payment.assets[0].url}
                                                target="_blank"
                                                className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Download className="h-4 w-4" />
                                            </a>
                                        ) : (
                                            <span className="text-xs text-slate-400">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden grid grid-cols-1 gap-3">
                {payments.map((payment) => (
                    <div
                        key={payment.id}
                        onClick={() => toggleSelection(payment.id)}
                        className={cn(
                            "bg-white rounded-2xl p-4 border transition-all relative overflow-hidden",
                            selectedIds.has(payment.id) ? "border-indigo-400 bg-indigo-50/30 shadow-sm" : "border-slate-200 shadow-sm"
                        )}
                    >
                        {selectedIds.has(payment.id) && (
                            <div className="absolute top-0 right-0 w-0 h-0 border-t-[36px] border-r-[36px] border-t-indigo-500 border-r-transparent">
                                <CheckSquare className="absolute -top-[30px] left-[6px] h-3.5 w-3.5 text-white" />
                            </div>
                        )}

                        <div className="flex justify-between items-start mb-3">
                            <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1", getStatusColor(payment.status))}>
                                {payment.status}
                            </span>
                            <div className="text-right">
                                <div className="text-xs text-slate-400">{format(new Date(payment.createdAt), "dd MMM")}</div>
                            </div>
                        </div>

                        <div className="flex justify-between items-end mb-3">
                            <div>
                                <h4 className="font-bold text-slate-900 text-lg">
                                    {formatMoney(payment.amount, payment.currency)}
                                </h4>
                                <div className="text-sm font-medium text-slate-600 flex items-center gap-1.5 mt-0.5">
                                    <FileText className="h-3.5 w-3.5 text-slate-400" />
                                    {payment.invoiceNumber || "No Invoice"}
                                </div>
                            </div>
                            {getCategoryBadge(payment.category)}
                        </div>

                        {payment.notes && (
                            <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-xl mb-3 line-clamp-2">
                                {payment.notes}
                            </p>
                        )}

                        {payment.assets?.length > 0 && (
                            <div className="flex justify-end pt-3 border-t border-slate-100">
                                <a
                                    href={payment.assets[0].url}
                                    target="_blank"
                                    className="text-xs font-semibold text-indigo-600 flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    Receipt
                                </a>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Render Bulk Actions */}
            <BulkPaymentActions
                selectedIds={Array.from(selectedIds)}
                onClearSelection={() => setSelectedIds(new Set())}
                projectId={projectId}
            />
        </div>
    );
}

"use client";

import { CreditCard, MoreVertical } from "lucide-react";
import type { PaymentData } from "./PaymentsClient";
import { formatStatus, getPaymentStatusStyle } from "./PaymentsClient";

type Props = {
    payment: PaymentData;
    showMaster: boolean;
};

export default function PaymentCard({ payment: p, showMaster }: Props) {
    const isPaid = p.status === "PAID";
    const dateStr = new Date(p.createdAt).toLocaleDateString("en-IN", {
        month: "short", day: "numeric", year: "numeric"
    });

    return (
        <div className="p-4 sm:p-5 flex flex-col gap-3 group bg-transparent hover:bg-muted/30 transition-colors">
            {/* Top Row: Amount & Action */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase border ${getPaymentStatusStyle(p.status)}`}>
                            {formatStatus(p.status)}
                        </span>
                        {p.category && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                {p.category}
                            </span>
                        )}
                    </div>
                    <div className="font-bold text-foreground text-xl flex items-center gap-1.5">
                        ₹{Number(p.amount).toLocaleString()}
                        {isPaid && (
                            <span className="flex h-4 w-4 rounded-full bg-emerald-100 items-center justify-center">
                                <svg className="h-2.5 w-2.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions Menu (Placeholder UI) */}
                <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors -mr-1.5">
                    <MoreVertical className="h-4 w-4" />
                </button>
            </div>

            {/* Middle Row: Details */}
            <div className="space-y-1 mt-1">
                {p.invoiceNumber && (
                    <div className="flex items-center gap-1.5 text-sm">
                        <span className="text-muted-foreground">Invoice:</span>
                        <span className="font-medium text-foreground">{p.invoiceNumber}</span>
                    </div>
                )}

                {showMaster && (
                    <div className="space-y-0.5 mt-2 bg-muted/40 p-2.5 rounded-xl border border-border/50">
                        <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                            <CreditCard className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="truncate">{p.project?.name}</span>
                        </div>
                        {p.project?.client?.name && (
                            <div className="pl-5 text-xs text-muted-foreground truncate">
                                Client: {p.project.client.name}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Row: Metadata */}
            <div className="flex items-center justify-between mt-1 text-[11px] font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                    <span className="uppercase tracking-wide">{p.currency}</span>
                    {p.dueDate && (
                        <>
                            <span>·</span>
                            <span className={p.status === "OVERDUE" ? "text-red-500 font-semibold" : ""}>
                                Due: {new Date(p.dueDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                            </span>
                        </>
                    )}
                </div>
                <span>{dateStr}</span>
            </div>
        </div>
    );
}

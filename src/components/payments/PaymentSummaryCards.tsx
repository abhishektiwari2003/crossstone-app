"use client";

import { usePaymentSummary } from "@/hooks/usePayments";
import { formatCurrency } from "@/lib/utils"; // Assuming a utility or I can just write it inline
import { CheckCircle2, Clock, AlertTriangle, Wallet } from "lucide-react";
import { ListSkeleton } from "@/components/ui/ListSkeleton";

interface Props {
    projectId: string;
}

export default function PaymentSummaryCards({ projectId }: Props) {
    const { summary, isLoading, isError } = usePaymentSummary(projectId);

    if (isError) {
        return (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 flex items-center justify-center font-medium shadow-sm">
                Failed to load payment summary
            </div>
        );
    }

    if (isLoading || !summary) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md pt-2 pb-2">
                <ListSkeleton count={4} height="h-28" />
            </div>
        );
    }

    // Using shared formatCurrency from utils

    const calcPercentage = (amount: number) => {
        if (summary.totalAmount === 0) return 0;
        return Math.round((amount / summary.totalAmount) * 100);
    };

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 sticky top-[60px] md:top-0 z-20 pb-2 bg-slate-50/90 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-50/60 pt-2 -mx-4 px-4 md:mx-0 md:px-0">
            {/* Total Amount */}
            <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between h-[110px] md:h-[120px]">
                <div className="flex justify-between items-start">
                    <p className="text-xs md:text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Value</p>
                    <div className="p-1.5 md:p-2 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
                        <Wallet className="h-4 w-4 md:h-5 md:w-5 text-indigo-500" />
                    </div>
                </div>
                <div>
                    <h3 className="text-lg md:text-2xl font-bold text-slate-900 tracking-tight truncate">
                        {formatCurrency(summary.totalAmount)}
                    </h3>
                </div>
            </div>

            {/* Paid Amount */}
            <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between h-[110px] md:h-[120px]">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-xs md:text-sm font-semibold text-slate-500 uppercase tracking-wider">Paid</p>
                    <div className="p-1.5 md:p-2 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
                        <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-emerald-600" />
                    </div>
                </div>
                <div>
                    <div className="flex items-end justify-between mb-1.5">
                        <h3 className="text-lg md:text-2xl font-bold text-emerald-700 tracking-tight truncate">
                            {formatCurrency(summary.paidAmount)}
                        </h3>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                            {calcPercentage(summary.paidAmount)}%
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${calcPercentage(summary.paidAmount)}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Pending Amount */}
            <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between h-[110px] md:h-[120px]">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-xs md:text-sm font-semibold text-slate-500 uppercase tracking-wider">Pending</p>
                    <div className="p-1.5 md:p-2 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                        <Clock className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                    </div>
                </div>
                <div>
                    <div className="flex items-end justify-between mb-1.5">
                        <h3 className="text-lg md:text-2xl font-bold text-blue-700 tracking-tight truncate">
                            {formatCurrency(summary.pendingAmount)}
                        </h3>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">
                            {calcPercentage(summary.pendingAmount)}%
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${calcPercentage(summary.pendingAmount)}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Overdue Amount */}
            <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between h-[110px] md:h-[120px]">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-xs md:text-sm font-semibold text-slate-500 uppercase tracking-wider text-red-600">Overdue</p>
                    <div className="p-1.5 md:p-2 bg-red-50 rounded-xl group-hover:bg-red-100 transition-colors">
                        <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
                    </div>
                </div>
                <div>
                    <div className="flex items-end justify-between mb-1.5">
                        <h3 className="text-lg md:text-2xl font-bold text-red-700 tracking-tight truncate">
                            {formatCurrency(summary.overdueAmount)}
                        </h3>
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-md">
                            {calcPercentage(summary.overdueAmount)}%
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${calcPercentage(summary.overdueAmount)}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

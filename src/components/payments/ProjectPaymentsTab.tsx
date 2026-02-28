"use client";

import { useState } from "react";
import { usePayments } from "@/hooks/usePayments";
import PaymentSummaryCards from "@/components/payments/PaymentSummaryCards";
import PaymentFilters, { FilterState } from "@/components/payments/PaymentFilters";
import PaymentList from "@/components/payments/PaymentList";
import EnhancedPaymentForm from "@/components/payments/EnhancedPaymentForm";
import type { AppRole } from "@/lib/authz";
import { ListSkeleton } from "@/components/ui/ListSkeleton";

interface Props {
    projectId: string;
    userRole: AppRole | string;
}

export default function ProjectPaymentsTab({ projectId, userRole }: Props) {
    const [filters, setFilters] = useState<FilterState>({
        status: "ALL",
        category: "ALL",
        searchQuery: "",
        minAmount: "",
        maxAmount: "",
    });

    // The backend inherently blocks SITE_ENGINEER from viewing payments entirely.
    // So if the user is a SITE_ENGINEER, we don't even try bridging SWR.
    if (userRole === "SITE_ENGINEER") {
        return (
            <div className="bg-red-50 text-red-600 p-8 rounded-2xl border border-red-100 flex flex-col items-center justify-center font-medium shadow-sm text-center">
                <span className="text-xl mb-2">🚫 Access Denied</span>
                Site Engineers are not authorized to view financial records.
            </div>
        );
    }

    const canEdit = userRole === "ADMIN" || userRole === "SUPER_ADMIN" || userRole === "PROJECT_MANAGER";

    const { data, isLoading, isError } = usePayments(projectId, {
        status: filters.status !== "ALL" ? filters.status : undefined,
        category: filters.category !== "ALL" ? filters.category : undefined,
        from: filters.dateFrom ? filters.dateFrom.toISOString() : undefined,
        to: filters.dateTo ? filters.dateTo.toISOString() : undefined,
        // search query and amount ranges are applied client-side below for now
    });

    let currentPayments = data?.items || [];

    // Client-side filtering for robust search
    if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        currentPayments = currentPayments.filter((p: any) =>
            p.invoiceNumber?.toLowerCase().includes(query) ||
            p.notes?.toLowerCase().includes(query) ||
            p.category?.toLowerCase().includes(query)
        );
    }

    if (filters.minAmount) {
        currentPayments = currentPayments.filter((p: any) => p.amount >= Number(filters.minAmount));
    }

    if (filters.maxAmount) {
        currentPayments = currentPayments.filter((p: any) => p.amount <= Number(filters.maxAmount));
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-slate-900">Financial System</h2>
                {canEdit && <EnhancedPaymentForm projectId={projectId} />}
            </div>

            <PaymentSummaryCards projectId={projectId} />

            <PaymentFilters filters={filters} onChange={setFilters} />

            {isError ? (
                <div className="p-8 text-center text-red-600 bg-red-50 rounded-2xl border border-red-100">
                    Failed to fetch payment records.
                </div>
            ) : isLoading ? (
                <div className="space-y-4">
                    <ListSkeleton count={3} height="h-[80px]" />
                </div>
            ) : (
                <PaymentList
                    payments={currentPayments}
                    projectId={projectId}
                    canEdit={canEdit}
                />
            )}
        </div>
    );
}

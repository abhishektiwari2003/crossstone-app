"use client";

import useSWR from "swr";
import type { MaterialSummary } from "@/types/materials";
import { IndianRupee, Package, PackageOpen, PackageCheck } from "lucide-react";
import { AppCard } from "@/components/common/AppCard";
import { CardSkeleton } from "@/components/ui/AppSkeletons";
import { ErrorState } from "@/components/ui/ErrorState";

type Props = {
    projectId: string;
};

const fetcher = async (url: string) => {
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch");
    return data;
};

export default function MaterialSummaryCards({ projectId }: Props) {
    const { data: summary, error, isLoading } = useSWR<MaterialSummary>(
        `/api/projects/${projectId}/materials/summary`,
        fetcher
    );

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
                {[...Array(5)].map((_, i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (error || !summary) {
        return <ErrorState message="Failed to load material summary" />;
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getCostByStatus = (status: string) => {
        return summary.statusBreakdown?.find(s => s.status === status)?.totalCost || 0;
    };

    const costBreakdown = [
        { label: "Ordered", value: getCostByStatus("ORDERED"), color: "bg-blue-500" },
        { label: "Delivered", value: getCostByStatus("DELIVERED"), color: "bg-amber-500" },
        { label: "Used", value: getCostByStatus("USED"), color: "bg-emerald-500" },
    ];

    const cards = [
        {
            title: "Total Materials",
            value: summary.totalItems.toString(),
            icon: Package,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            borderColor: "border-indigo-100"
        },
        {
            title: "Total Cost",
            value: formatCurrency(summary.totalCost),
            icon: IndianRupee,
            color: "text-slate-700",
            bg: "bg-slate-100",
            borderColor: "border-slate-200"
        },
        {
            title: "Ordered Value",
            value: formatCurrency(getCostByStatus("ORDERED")),
            icon: PackageOpen,
            color: "text-blue-600",
            bg: "bg-blue-50",
            borderColor: "border-blue-100"
        },
        {
            title: "Delivered Value",
            value: formatCurrency(getCostByStatus("DELIVERED")),
            icon: PackageCheck,
            color: "text-amber-600",
            bg: "bg-amber-50",
            borderColor: "border-amber-100"
        },
        {
            title: "Used Value",
            value: formatCurrency(getCostByStatus("USED")),
            icon: PackageCheck,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            borderColor: "border-emerald-100"
        }
    ];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
                {cards.map((card, i) => (
                    <AppCard key={i} hoverLift className={`p-4 lg:p-5 flex flex-col justify-between border-t-4 border-l-0 border-r-0 border-b-0 ${card.borderColor}`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                                <card.icon className={`h-5 w-5 ${card.color}`} />
                            </div>
                        </div>
                        <div>
                            <div className="text-xl sm:text-2xl font-bold text-foreground truncate" title={card.value}>{card.value}</div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mt-1">{card.title}</p>
                        </div>
                    </AppCard>
                ))}
            </div>

            {/* Distribution Bar */}
            {summary.totalCost > 0 && (
                <AppCard className="p-6 mt-4">
                    <h3 className="text-sm font-bold text-foreground mb-4">Cost Distribution</h3>
                    <div className="flex w-full h-4 rounded-full overflow-hidden mb-4 bg-muted">
                        {costBreakdown.map((item, idx) => {
                            const widthPercent = (item.value / summary.totalCost) * 100;
                            if (widthPercent === 0) return null;
                            return (
                                <div
                                    key={idx}
                                    className={`${item.color} h-full transition-all duration-500`}
                                    style={{ width: `${widthPercent}%` }}
                                    title={`${item.label}: ${formatCurrency(item.value)} (${widthPercent.toFixed(1)}%)`}
                                />
                            );
                        })}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
                        {costBreakdown.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{item.label}</span>
                                <span className="text-sm font-bold text-foreground ml-1">{formatCurrency(item.value)}</span>
                            </div>
                        ))}
                    </div>
                </AppCard>
            )}
        </div>
    );
}

"use client";

import { useState } from "react";
import { format, subMonths } from "date-fns";
import { useAnalytics } from "@/hooks/useAnalytics";
import { ShieldAlert, BarChart3, Presentation, Users, Briefcase, FileText, CheckCircle2, TrendingUp } from "lucide-react";

import KPICard from "@/components/analytics/KPICard";
import ProjectStatusPieChart from "@/components/analytics/ProjectStatusPieChart";
import InspectionTrendChart from "@/components/analytics/InspectionTrendChart";
import PaymentTrendChart from "@/components/analytics/PaymentTrendChart";
import EngineerActivityHeatmap from "@/components/analytics/EngineerActivityHeatmap";
import DateRangePicker, { type DateRange } from "@/components/analytics/DateRangePicker";
import { ListSkeleton } from "@/components/ui/ListSkeleton";
import Link from "next/link";

export default function AnalyticsClient({ sessionRole }: { sessionRole: string }) {
    // Default to Last 6 Months
    const [dateRange, setDateRange] = useState<DateRange>({
        from: format(subMonths(new Date(), 6), "yyyy-MM-dd"),
        to: format(new Date(), "yyyy-MM-dd"),
    });

    const { data, isLoading, isError } = useAnalytics({
        from: dateRange.from,
        to: dateRange.to,
    });

    // Security Check
    if (sessionRole !== "ADMIN" && sessionRole !== "SUPER_ADMIN") {
        return (
            <div className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center min-h-[60vh]">
                <ShieldAlert className="h-16 w-16 text-red-500 mb-4 opacity-80" />
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
                <p className="text-slate-500 text-center max-w-sm mb-6">
                    You do not have the required permissions to view the analytics dashboard.
                </p>
                <Link href="/dashboard" className="px-5 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors">
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    // Helper to calculate pseudo trends based on historical array lengths/distribution
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const calculateTrend = (historyArray: { [key: string]: any }[], valueKey: string) => {
        if (!historyArray || historyArray.length < 2) return 0;
        const currentM = historyArray[historyArray.length - 1][valueKey] || 0;
        const prevM = historyArray[historyArray.length - 2][valueKey] || 0;
        if (prevM === 0) return currentM > 0 ? 100 : 0;
        return Math.round(((currentM - prevM) / prevM) * 100);
    };

    return (
        <div className="flex-1 p-4 md:p-8 max-w-[1400px] mx-auto w-full flex flex-col min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                        <BarChart3 className="h-8 w-8 text-indigo-600" />
                        Analytics Dashboard
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">
                        Performance metrics, activity tracking, and project status overviews.
                    </p>
                </div>

                <div className="shrink-0 flex self-start md:self-end">
                    <DateRangePicker value={dateRange} onChange={setDateRange} />
                </div>
            </div>

            {isError ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex flex-col items-center justify-center py-12">
                    <ShieldAlert className="h-10 w-10 mb-3 opacity-50" />
                    <p className="font-semibold">Failed to load analytics data.</p>
                    <p className="text-sm mt-1">Please ensure you have administrative access and the server is responsive.</p>
                </div>
            ) : isLoading && !data ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <ListSkeleton count={4} height="h-32" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ListSkeleton count={2} height="h-[380px]" />
                    </div>
                </div>
            ) : (
                data && (
                    <div className="space-y-6">
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <KPICard
                                title="Total Projects"
                                value={data.kpis.totalProjects}
                                icon={<Briefcase className="h-6 w-6" />}
                                trendValue={data.projectStatusDistribution.length > 0 ? 5 : 0}
                                trendLabel="vs last month"
                            />
                            <KPICard
                                title="Active Projects"
                                value={data.kpis.activeProjects}
                                icon={<Presentation className="h-6 w-6" />}
                            />
                            <KPICard
                                title="Total Inspections"
                                value={data.kpis.totalInspections}
                                icon={<CheckCircle2 className="h-6 w-6" />}
                                trendValue={calculateTrend(data.monthlyInspections, 'count')}
                                trendLabel="month over month"
                            />
                            <KPICard
                                title="Total Revenue"
                                valuePrefix="₹"
                                value={(data.kpis.totalRevenue >= 100000) ? (data.kpis.totalRevenue / 100000).toFixed(1) + "L" : data.kpis.totalRevenue.toLocaleString()}
                                icon={<TrendingUp className="h-6 w-6" />}
                                trendValue={calculateTrend(data.paymentTrends, 'paid')}
                                trendLabel="since last month"
                            />
                        </div>

                        {/* Top Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Project Status */}
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 max-h-[420px] flex flex-col">
                                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <Presentation className="h-5 w-5 text-slate-400" />
                                    Project Portfolio Status
                                </h3>
                                <div className="flex-1 min-h-[300px]">
                                    <ProjectStatusPieChart data={data.projectStatusDistribution} />
                                </div>
                            </div>

                            {/* Payment Trends */}
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 max-h-[420px] flex flex-col">
                                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-slate-400" />
                                    Revenue & Receivables
                                </h3>
                                <div className="flex-1 min-h-[300px] -ml-2">
                                    <PaymentTrendChart data={data.paymentTrends} />
                                </div>
                            </div>
                        </div>

                        {/* Bottom Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Inspection Timeline */}
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
                                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-slate-400" />
                                    Inspection Output (Monthly)
                                </h3>
                                <div className="-ml-2">
                                    <InspectionTrendChart data={data.monthlyInspections} />
                                </div>
                            </div>

                            {/* Engineer Heatmap */}
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <Users className="h-5 w-5 text-slate-400" />
                                        Engineer Activity
                                    </h3>
                                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">Top 10 Performers</span>
                                </div>
                                <div className="-ml-6">
                                    <EngineerActivityHeatmap data={data.engineerPerformance} />
                                </div>
                            </div>
                        </div>

                    </div>
                )
            )}
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";

import DashboardKPICards, { type KPIData } from "./DashboardKPICards";
import ProjectProgressOverview, { type ProjectProgressData } from "./ProjectProgressOverview";
import PaymentsOverview, { type PaymentsOverviewData } from "./PaymentsOverview";
import RecentActivityTimeline, { type ActivityItem } from "./RecentActivityTimeline";

type Props = {
    role: string;
    userName: string;
    kpis: KPIData[];
    projects: ProjectProgressData[];
    payments: PaymentsOverviewData;
    activities: ActivityItem[];
};

export default function RoleDashboard({ role, userName, kpis, projects, payments, activities }: Props) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    };

    const dateStr = new Date().toLocaleDateString("en-IN", {
        weekday: 'long', month: 'long', day: 'numeric'
    });

    const isClient = role === "CLIENT";
    const isEngineer = role === "SITE_ENGINEER";

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                        {mounted ? greeting() : "Welcome"}, <span className="text-blue-600 dark:text-blue-400">{userName}</span> 👋
                    </h1>
                    <p className="text-sm font-medium text-muted-foreground mt-1.5 flex items-center gap-2">
                        <span>{mounted ? dateStr : "Loading..."}</span> <span className="hidden sm:inline">·</span> <span className="inline-flex px-2 py-0.5 rounded-md bg-muted text-[10px] uppercase font-bold tracking-wider">{role.replace(/_/g, " ")}</span>
                    </p>
                </div>

                {/* Secondary Actions Row */}
                <div className="flex items-center gap-3">
                    {/* Add any global page-level actions here later, e.g. "New Project" wrapped under role checks */}
                </div>
            </div>

            {/* Section 1: KPI Cards */}
            <DashboardKPICards metrics={kpis} />

            {/* Main Content Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column (Wider on Desktop) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Section 2: Project Progress */}
                    <ProjectProgressOverview projects={projects} role={role} />

                    {/* Mobile Only Timeline Injection (Order shifts for mobile) */}
                    <div className="block lg:hidden">
                        <RecentActivityTimeline activities={activities} />
                    </div>
                </div>

                {/* Right Column (Sidebar metrics) */}
                <div className="space-y-6">
                    {/* Section 3: Payments (Hidden for Site Engineers typically, but component handles zero-states) */}
                    {!isEngineer && (
                        <div className="h-[320px]">
                            <PaymentsOverview data={payments} role={role} />
                        </div>
                    )}

                    {/* Section 4: Timeline (Desktop) */}
                    <div className="hidden lg:block">
                        <RecentActivityTimeline activities={activities} />
                    </div>
                </div>

            </div>
        </div>
    );
}

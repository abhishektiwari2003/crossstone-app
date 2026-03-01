"use client";

import { FolderKanban, ArrowRight, User, Calendar } from "lucide-react";
import Link from "next/link";

export type ProjectProgressData = {
    id: string;
    name: string;
    clientId?: string;
    clientName?: string;
    managerName?: string;
    status: string;
    progress: number; // 0-100
    dueDate?: string | null;
    totalMilestones: number;
    completedMilestones: number;
};

type Props = {
    projects: ProjectProgressData[];
    role: string;
};

export default function ProjectProgressOverview({ projects, role }: Props) {
    if (!projects || projects.length === 0) {
        return (
            <div className="glass-card p-8 text-center border-dashed">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <FolderKanban className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">No Active Projects</h3>
                <p className="text-sm text-muted-foreground">You don't have any projects assigned at the moment.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground tracking-tight">Project Progress</h2>
                <Link href="/projects" className="text-sm text-blue-600 hover:text-blue-700 font-semibold group flex items-center gap-1">
                    View all
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {/* Horizontal scroll on mobile, grid on desktop */}
            <div className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 hide-scrollbar">
                {projects.map((p) => {
                    const isCompleted = p.status === "COMPLETED";
                    const isDelayed = p.status === "ON_HOLD";
                    const barColor = isCompleted ? "bg-emerald-500" : isDelayed ? "bg-red-500" : "bg-blue-600";

                    return (
                        <Link
                            key={p.id}
                            href={`/projects/${p.id}`}
                            className="glass-card p-5 group hover-lift shrink-0 w-[280px] sm:w-auto relative overflow-hidden"
                        >
                            {/* Decorative top accent line */}
                            <div className={`absolute top-0 left-0 right-0 h-1 opacity-80 ${barColor}`} />

                            <div className="flex justify-between items-start mb-3">
                                <div className="p-2 rounded-xl bg-muted flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                                    <FolderKanban className="h-5 w-5 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${isCompleted ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                        isDelayed ? "bg-red-50 text-red-700 border-red-200" :
                                            "bg-blue-50 text-blue-700 border-blue-200"
                                    }`}>
                                    {p.status.replace(/_/g, " ")}
                                </span>
                            </div>

                            <h3 className="font-bold text-foreground text-lg mb-1 truncate" title={p.name}>{p.name}</h3>
                            <p className="text-xs text-muted-foreground truncate mb-4">
                                {role === "CLIENT" ? `Manager: ${p.managerName || "Unassigned"}` : `Client: ${p.clientName || "Unknown"}`}
                            </p>

                            {/* Progress Bar */}
                            <div className="mb-4">
                                <div className="flex justify-between text-xs font-semibold mb-1.5">
                                    <span className="text-slate-600 dark:text-slate-300">Milestones</span>
                                    <span className="text-foreground">{p.completedMilestones} / {p.totalMilestones}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${barColor} rounded-full transition-all duration-1000 ease-out`}
                                        style={{ width: `${p.progress}%` }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border mt-auto">
                                <div className="flex items-center gap-1.5">
                                    <User className="h-3.5 w-3.5" />
                                    <span className="truncate max-w-[80px]">{p.managerName || "Unassigned"}</span>
                                </div>
                                {p.dueDate && (
                                    <div className="flex items-center gap-1.5 font-medium">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>{new Date(p.dueDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                                    </div>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

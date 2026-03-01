"use client";

import type { UserProfileProjectAssigned } from "@/types/user-profile";
import { ArrowRight, FolderKanban, User } from "lucide-react";
import Link from "next/link";

function getStatusStyle(status: string) {
    switch (status) {
        case "PLANNED": return "status-planned";
        case "IN_PROGRESS": return "status-in-progress";
        case "ON_HOLD": return "status-on-hold";
        case "COMPLETED": return "status-completed";
        default: return "status-pending";
    }
}

function formatStatus(status: string) {
    return status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

type Props = {
    projects: UserProfileProjectAssigned[];
};

export default function UserProjectsList({ projects }: Props) {
    if (!projects || projects.length === 0) {
        return (
            <div className="glass-card p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
                    <FolderKanban className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">No assigned projects</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">This user has not been added to any active projects yet.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(({ id, role, createdAt, project }) => (
                <div key={id} className="glass-card hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group border border-slate-200/60 shadow-sm relative">
                    <div className="p-5 flex-1 relative z-10 bg-white">
                        <div className="flex items-start justify-between gap-3 mb-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold shadow-sm ${getStatusStyle(project.status)}`}>
                                {formatStatus(project.status)}
                            </span>
                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                                {role.replace(/_/g, " ")}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                            {project.name}
                        </h3>

                        <div className="flex items-center gap-2 mt-4 text-sm text-slate-600">
                            <User className="h-4 w-4 text-slate-400" />
                            <span className="line-clamp-1 font-medium text-slate-700">Manager: {project.manager?.name || "Unassigned"}</span>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                        <span className="text-xs font-medium text-slate-500">
                            Added: {new Date(createdAt).toLocaleDateString()}
                        </span>
                        <Link
                            href={`/projects/${project.id}`}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-full transition-colors"
                        >
                            View Project
                            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
}

"use client";

import { useState } from "react";
import { Plus, MessageSquare } from "lucide-react";
import { useQueries } from "@/hooks/useQueries";
import QueryList from "./QueryList";
import QueryCreateForm from "./QueryCreateForm";
import QueryThread from "./QueryThread";
import type { UserRole } from "@/types/drawings";

type Props = {
    projectId: string;
    userRole: UserRole;
};

export default function ProjectQuarriesTab({ projectId, userRole }: Props) {
    const { queries, isLoading, isError, mutate } = useQueries(projectId);
    const [view, setView] = useState<"list" | "create" | "thread">("list");
    const [selectedQueryId, setSelectedQueryId] = useState<string | null>(null);

    const canCreate = userRole === "CLIENT";

    const handleSelectQuery = (id: string) => {
        setSelectedQueryId(id);
        setView("thread");
    };

    const handleBackToList = () => {
        setSelectedQueryId(null);
        setView("list");
        mutate(); // Refresh the list in case status or responses changed
    };

    if (isLoading) {
        return (
            <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="h-6 w-32 bg-slate-200 animate-pulse rounded" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="glass-card p-6 h-40 animate-pulse">
                            <div className="h-4 w-1/3 bg-slate-200 rounded mb-4" />
                            <div className="h-3 w-3/4 bg-slate-200 rounded mb-2" />
                            <div className="h-3 w-1/2 bg-slate-200 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl border border-red-100">
                Failed to load project queries. Please try refreshing.
            </div>
        );
    }

    return (
        <div className="space-y-4 relative">
            {/* Header Area */}
            {view === "list" && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 lg:p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                            <MessageSquare className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 leading-tight">Project Issues & Quarries</h2>
                            <p className="text-sm text-slate-500">Track and respond to client requests</p>
                        </div>
                    </div>
                    {canCreate && (
                        <button
                            onClick={() => setView("create")}
                            className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2 group min-h-[44px]"
                        >
                            <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
                            Raise Issue
                        </button>
                    )}
                </div>
            )}

            {/* Content Area */}
            {view === "create" && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Raise a New Issue</h3>
                    <QueryCreateForm
                        projectId={projectId}
                        onSuccess={() => {
                            setView("list");
                            mutate();
                        }}
                        onCancel={() => setView("list")}
                    />
                </div>
            )}

            {view === "thread" && selectedQueryId && (
                <QueryThread
                    queryId={selectedQueryId}
                    onBack={handleBackToList}
                    userRole={userRole}
                />
            )}

            {view === "list" && (
                <QueryList
                    queries={queries}
                    onSelectQuery={handleSelectQuery}
                />
            )}
        </div>
    );
}

"use client";

import { useState } from "react";
import { useAuditLogs } from "@/hooks/useAudit";
import { format } from "date-fns";
import { ShieldAlert, Search, Code2, ArrowLeft, RefreshCw, User } from "lucide-react";
import { getActionIcon } from "@/components/audit/ActionIcon";
import AuditMetadataDialog from "@/components/audit/AuditMetadataDialog";
import { ListSkeleton } from "@/components/ui/ListSkeleton";
import Link from "next/link";

export default function AuditLogClient({ sessionRole }: { sessionRole: string }) {

    // Filters
    const [actionFilter, setActionFilter] = useState("");
    const [projectFilter, setProjectFilter] = useState("");
    const [userFilter, setUserFilter] = useState("");

    const [selectedMetadata, setSelectedMetadata] = useState<Record<string, any> | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const { logs, total, isLoading, isError, mutate } = useAuditLogs({
        action: actionFilter || undefined,
        projectId: projectFilter || undefined,
        userId: userFilter || undefined,
        limit: 50 // Show top 50 recent for simplistic view
    });

    // Security Check: Only admins should see this page
    if (sessionRole !== "ADMIN" && sessionRole !== "SUPER_ADMIN") {
        return (
            <div className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center min-h-[60vh]">
                <ShieldAlert className="h-16 w-16 text-red-500 mb-4 opacity-80" />
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
                <p className="text-slate-500 text-center max-w-sm mb-6">
                    You do not have the required permissions to view the system audit logs.
                </p>
                <Link href="/dashboard" className="px-5 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors">
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="flex-1 p-4 md:p-8 max-w-[1400px] mx-auto w-full flex flex-col min-h-screen">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div className="flex items-start gap-4">
                    <Link
                        href="/dashboard"
                        className="mt-1 p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors shrink-0"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                            <ShieldAlert className="h-8 w-8 text-indigo-600" />
                            System Audit Logs
                        </h1>
                        <p className="text-slate-500 mt-2 text-lg">
                            Track and monitor all administrative and user actions across the platform.
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 sticky top-4 z-20">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Filter by Action (e.g. CREATE_USER)"
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900"
                        />
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Filter by User ID"
                            value={userFilter}
                            onChange={(e) => setUserFilter(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900"
                        />
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Filter by Project ID"
                            value={projectFilter}
                            onChange={(e) => setProjectFilter(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900"
                        />
                    </div>

                    <button
                        onClick={() => mutate()}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                        Refresh Logs
                    </button>
                </div>
            </div>

            {/* Error State */}
            {isError && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex flex-col items-center justify-center py-12">
                    <ShieldAlert className="h-10 w-10 mb-3 opacity-50" />
                    <p className="font-semibold">Failed to load audit logs.</p>
                    <p className="text-sm mt-1 mb-4">The server might be down or you lack permissions.</p>
                    <button onClick={() => mutate()} className="px-4 py-2 bg-white border border-red-200 rounded-lg text-sm font-medium hover:bg-red-50">Try Again</button>
                </div>
            )}

            {/* Mobile Cards / Desktop Table */}
            {!isError && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex-1">
                    {isLoading ? (
                        <div className="p-6">
                            <ListSkeleton count={8} height="h-16" />
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-16 text-center">
                            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                <Search className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No audit logs found</h3>
                            <p className="text-slate-500 max-w-md mx-auto">
                                Try adjusting your filters or search terms. Actions taken by users will appear here automatically.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                        <th className="p-4 pl-6 w-16">Action</th>
                                        <th className="p-4">Details</th>
                                        <th className="p-4">Entity</th>
                                        <th className="p-4 hidden md:table-cell">User / Context</th>
                                        <th className="p-4 hidden sm:table-cell">Date & Time</th>
                                        <th className="p-4 pr-6 text-right">View Data</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {logs.map((log) => {
                                        const hasMetadata = log.metadata && Object.keys(log.metadata).length > 0;
                                        return (
                                            <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="p-4 pl-6 text-center">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto group-hover:bg-white group-hover:shadow-sm transition-all">
                                                        {getActionIcon(log.action)}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-semibold text-slate-900 mb-1">{log.action}</div>
                                                    <div className="text-xs text-slate-500 font-mono bg-slate-100 inline-block px-1.5 py-0.5 rounded">
                                                        {log.id.split('-')[0]}...
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-medium text-slate-800">{log.entity}</div>
                                                    <div className="text-xs text-slate-500 font-mono truncate max-w-[120px]" title={log.entityId}>
                                                        ref: {log.entityId.substring(0, 8)}
                                                    </div>
                                                </td>
                                                <td className="p-4 hidden md:table-cell">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <User className="h-3 w-3 text-slate-400" />
                                                        <span className="text-sm text-slate-700 truncate max-w-[150px]" title={log.userId}>
                                                            {log.userName || log.userId.substring(0, 12)}
                                                        </span>
                                                    </div>
                                                    {log.projectId && (
                                                        <div className="text-xs text-slate-500 truncate max-w-[150px]">
                                                            Project: {log.projectId.substring(0, 12)}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4 hidden sm:table-cell">
                                                    <div className="text-sm font-medium text-slate-700">
                                                        {format(new Date(log.createdAt), "MMM d, yyyy")}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {format(new Date(log.createdAt), "h:mm:ss a")}
                                                    </div>
                                                </td>
                                                <td className="p-4 pr-6 text-right">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedMetadata(log.metadata);
                                                            setDialogOpen(true);
                                                        }}
                                                        disabled={!hasMetadata}
                                                        className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-slate-200 hover:border-indigo-200"
                                                        title={hasMetadata ? "View JSON Metadata" : "No metadata attached"}
                                                    >
                                                        <Code2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            <AuditMetadataDialog
                isOpen={dialogOpen}
                onClose={() => setDialogOpen(false)}
                metadata={selectedMetadata}
            />
        </div>
    );
}


"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Send, User, ChevronDown, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useQueryDetail } from "@/hooks/useQueries";
import AttachmentPreview from "./AttachmentPreview";
import type { UserRole } from "@/types/drawings";
import type { QueryStatus, QueryResponse } from "@/types/queries";

type Props = {
    queryId: string;
    onBack: () => void;
    userRole: UserRole;
};

const STATUS_ICONS: Record<QueryStatus, React.ReactNode> = {
    OPEN: <AlertCircle className="h-4 w-4 text-red-600" />,
    IN_PROGRESS: <Clock className="h-4 w-4 text-orange-600" />,
    RESOLVED: <CheckCircle2 className="h-4 w-4 text-emerald-600" />
};

const STATUS_LABELS: Record<QueryStatus, string> = {
    OPEN: "Open",
    IN_PROGRESS: "In Progress",
    RESOLVED: "Resolved"
};

const STATUS_BG: Record<QueryStatus, string> = {
    OPEN: "bg-red-50 text-red-700 border-red-200",
    IN_PROGRESS: "bg-orange-50 text-orange-700 border-orange-200",
    RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200"
};

export default function QueryThread({ queryId, onBack, userRole }: Props) {
    const { query, isLoading, isError, mutate } = useQueryDetail(queryId);
    const [replyMsg, setReplyMsg] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const canRespond = userRole === "CLIENT" || userRole === "ADMIN" || userRole === "SUPER_ADMIN" || userRole === "PROJECT_MANAGER";
    const canChangeStatus = userRole === "ADMIN" || userRole === "SUPER_ADMIN" || userRole === "PROJECT_MANAGER";

    if (isLoading) {
        return (
            <div className="flex flex-col h-[60vh] justify-center items-center animate-pulse space-y-4">
                <div className="w-12 h-12 bg-slate-200 rounded-full" />
                <div className="h-4 bg-slate-200 w-1/3 rounded" />
            </div>
        );
    }

    if (isError || !query) {
        return (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">
                Failed to load the issue thread. Please try again.
            </div>
        );
    }

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        setIsUpdatingStatus(true);
        try {
            await fetch(`/api/queries/${queryId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: e.target.value })
            });
            mutate();
        } catch (error) {
            console.error("Failed to update status", error);
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyMsg.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/queries/${queryId}/responses`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: replyMsg })
            });

            if (res.ok) {
                setReplyMsg("");
                mutate(); // Refresh thread
                // Scroll to bottom
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-200px)] lg:min-h-0 bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden relative shadow-sm">
            {/* Thread Header */}
            <div className="bg-white border-b border-slate-200 p-4 sticky top-0 z-20 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3 w-full">
                    <button
                        onClick={onBack}
                        className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-base font-bold text-slate-900 truncate">{query.title}</h2>
                        <p className="text-xs text-slate-500">By {query.author?.name || "Client"} • {formatDistanceToNow(new Date(query.createdAt))} ago</p>
                    </div>

                    {/* Status Dropdown (PM/Admin) or Badge (Client) */}
                    {canChangeStatus ? (
                        <div className="relative shrink-0 flex items-center">
                            <select
                                value={query.status}
                                onChange={handleStatusChange}
                                disabled={isUpdatingStatus}
                                className={`appearance-none font-semibold text-xs border rounded-full px-3 py-1.5 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-sm ${STATUS_BG[query.status as QueryStatus]}`}
                            >
                                <option value="OPEN">Open</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="RESOLVED">Resolved</option>
                            </select>
                            <ChevronDown className={`absolute right-2.5 h-3.5 w-3.5 pointer-events-none ${isUpdatingStatus ? "animate-pulse opacity-50" : "opacity-70"}`} />
                        </div>
                    ) : (
                        <div className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${STATUS_BG[query.status as QueryStatus]}`}>
                            {STATUS_ICONS[query.status as QueryStatus]}
                            <span className="hidden sm:inline">{STATUS_LABELS[query.status as QueryStatus]}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Thread Messages */}
            <div className="flex-1 p-4 pb-24 overflow-y-auto space-y-6 flex flex-col">

                {/* Original Query (Client Bubble) */}
                <div className="flex items-start gap-3 w-full md:w-[85%] self-start">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 shadow-sm border border-blue-200">
                        <span className="text-blue-700 font-bold text-xs">{query.author?.name?.charAt(0) || "C"}</span>
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                        <span className="text-xs font-semibold text-slate-500 ml-1">{query.author?.name} (Client)</span>
                        <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-4 shadow-sm relative">
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{query.description}</p>

                            {query.attachments && query.attachments.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <AttachmentPreview attachments={query.attachments} />
                                </div>
                            )}
                        </div>
                        <span className="text-[10px] text-slate-400 ml-1 mt-0.5">{new Date(query.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>

                {/* Responses */}
                {query.responses.map((res: QueryResponse) => {
                    const isClient = res.author.role === "CLIENT";

                    return (
                        <div key={res.id} className={`flex items-start gap-3 w-full md:w-[85%] ${isClient ? "self-start" : "self-end flex-row-reverse"}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${isClient ? "bg-blue-100 border-blue-200 text-blue-700" : "bg-orange-100 border-orange-200 text-orange-700"}`}>
                                {isClient ? <span className="font-bold text-xs">{res.author?.name?.charAt(0) || "C"}</span> : <User className="h-4 w-4" />}
                            </div>

                            <div className={`flex flex-col gap-1 w-full ${isClient ? "items-start" : "items-end"}`}>
                                <span className="text-xs font-semibold text-slate-500 px-1">{res.author?.name} {isClient ? "(Client)" : "(Team)"}</span>
                                <div className={`p-3.5 rounded-2xl shadow-sm text-sm ${isClient ? "bg-white border border-slate-200 rounded-tl-sm text-slate-700" : "bg-blue-600 text-white rounded-tr-sm"} leading-relaxed whitespace-pre-wrap ${!isClient && 'w-fit max-w-full text-left'}`}>
                                    {res.message}
                                </div>
                                <span className="text-[10px] text-slate-400 px-1 mt-0.5">{new Date(res.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Sticky Reply Box */}
            {canRespond && (
                <div className="bg-white border-t border-slate-200 p-3 sticky bottom-0 z-20 layout-pb shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <form onSubmit={handleReply} className="flex flex-col sm:flex-row items-end sm:items-center gap-2 max-w-4xl mx-auto w-full relative">
                        <textarea
                            value={replyMsg}
                            onChange={(e) => setReplyMsg(e.target.value)}
                            placeholder="Type a response..."
                            className="w-full bg-slate-100 border border-transparent rounded-2xl px-4 py-3 min-h-[50px] max-h-[120px] text-sm focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none transition-all placeholder:text-slate-400"
                            rows={1}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleReply(e);
                                }
                            }}
                        />
                        <button
                            type="submit"
                            disabled={!replyMsg.trim() || isSubmitting}
                            className="bg-blue-600 text-white p-3.5 rounded-2xl shadow-sm shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shrink-0 flex items-center justify-center absolute sm:static right-1 bottom-1 sm:right-auto sm:bottom-auto"
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

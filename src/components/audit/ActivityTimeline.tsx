"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import type { ProjectActivity, AuditLogAction } from "@/types/audit";
import { getActionIcon } from "./ActionIcon";
import AuditMetadataDialog from "./AuditMetadataDialog";
import { ListSkeleton } from "@/components/ui/ListSkeleton";

type Props = {
    activities: ProjectActivity[];
    isLoading?: boolean;
    isEmpty?: boolean;
};

// Helper to generate a human-readable title based on action and entity
function getActionTitle(action: AuditLogAction, entity: string, userName: string) {
    const actionMap: Record<string, string> = {
        CREATE_DRAWING: "uploaded a new drawing",
        UPDATE_DRAWING: "updated a drawing",
        APPROVE_DRAWING: "approved a drawing sequence",
        SUBMIT_INSPECTION: "submitted a site inspection",
        REVIEW_INSPECTION: "reviewed an inspection",
        CREATE_QUERY: "raised a new query",
        UPDATE_QUERY: "updated a query status",
        ADD_QUERY_RESPONSE: "replied to a query",
        RECORD_PAYMENT: "recorded a new payment",
        UPDATE_PAYMENT: "updated payment details",
    };

    const actionText = actionMap[action] || `performed an action on ${entity}`;
    return (
        <span>
            <span className="font-semibold text-slate-900">{userName}</span> {actionText}
        </span>
    );
}

export default function ActivityTimeline({ activities, isLoading, isEmpty }: Props) {
    const [selectedMetadata, setSelectedMetadata] = useState<Record<string, any> | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    if (isLoading) {
        return <ListSkeleton count={4} height="h-20" />;
    }

    if (isEmpty || activities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center mb-4">
                    <span className="text-slate-400 font-medium">No Data</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">No activity yet</h3>
                <p className="text-sm text-slate-500 max-w-sm">
                    Events will appear here once actions are taken within this project.
                </p>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-[20px] top-4 bottom-4 w-0.5 bg-slate-200 rounded-full" />

            <div className="space-y-6">
                {activities.map((activity, index) => {
                    const hasMetadata = activity.metadata && Object.keys(activity.metadata).length > 0;

                    return (
                        <div key={activity.id} className="relative flex gap-4 pr-2">
                            {/* Icon Indicator */}
                            <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-slate-200 shadow-sm shrink-0">
                                {getActionIcon(activity.action)}
                            </div>

                            {/* Content Card */}
                            <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-1 gap-2">
                                    <p className="text-sm text-slate-700 leading-snug">
                                        {getActionTitle(activity.action, activity.entity, activity.userName)}
                                    </p>
                                    <span className="text-xs font-medium text-slate-400 whitespace-nowrap shrink-0">
                                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 mt-3">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-600">
                                        {activity.action.replace(/_/g, " ")}
                                    </span>

                                    {hasMetadata && (
                                        <button
                                            onClick={() => {
                                                setSelectedMetadata(activity.metadata);
                                                setDialogOpen(true);
                                            }}
                                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                                        >
                                            View Details
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <AuditMetadataDialog
                isOpen={dialogOpen}
                onClose={() => setDialogOpen(false)}
                metadata={selectedMetadata}
            />
        </div>
    );
}

"use client";

import { useProjectActivity } from "@/hooks/useAudit";
import ActivityTimeline from "./ActivityTimeline";

type Props = {
    projectId: string;
};

export default function ProjectActivityTab({ projectId }: Props) {
    const { activity, isLoading, isError } = useProjectActivity(projectId);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Project Activity</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Timeline of recent actions on this project
                    </p>
                </div>
            </div>

            {isError ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                    Failed to load activity timeline. Please try again.
                </div>
            ) : (
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                    <ActivityTimeline
                        activities={activity}
                        isLoading={isLoading}
                        isEmpty={activity.length === 0}
                    />
                </div>
            )}
        </div>
    );
}

"use client";

import { CalendarClock, CheckCircle2 } from "lucide-react";
import type { ProjectReportTimelineEvent } from "@/types/reports";

type Props = {
    timeline: ProjectReportTimelineEvent[];
};

export default function ProjectTimeline({ timeline }: Props) {
    return (
        <div className="glass-card p-6 flex flex-col h-full bg-white">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 rounded-lg bg-violet-50">
                    <CalendarClock className="h-5 w-5 text-violet-600" />
                </div>
                <h3 className="font-semibold text-slate-900">Recent Activity Timeline</h3>
            </div>

            {timeline.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-8">
                    <CalendarClock className="h-10 w-10 mb-2 opacity-20" />
                    <p className="text-sm font-medium">No timeline events recorded yet.</p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent pb-4">
                        {timeline.map((event, i) => (
                            <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                {/* Icon */}
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-100 text-blue-600 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 transition-transform group-hover:scale-110">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>

                                {/* Card */}
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md hover:bg-white">
                                    <time className="text-xs font-bold text-blue-600 mb-1 block">
                                        {new Date(event.date).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </time>
                                    <div className="text-sm font-medium text-slate-800 leading-snug">
                                        {event.title}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

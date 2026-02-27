"use client";

import { TrendingUp, Award } from "lucide-react";

type Props = {
    progressPercent: number;
};

export default function MilestoneProgressChart({ progressPercent }: Props) {
    // Determine color based on rules: 0-30 Red, 30-70 Orange, 70-100 Green
    let colorClass = "bg-red-500";
    let bgClass = "bg-red-50";
    let textClass = "text-red-700";

    if (progressPercent > 70) {
        colorClass = "bg-emerald-500";
        bgClass = "bg-emerald-50";
        textClass = "text-emerald-700";
    } else if (progressPercent >= 30) {
        colorClass = "bg-orange-500";
        bgClass = "bg-orange-50";
        textClass = "text-orange-700";
    }

    return (
        <div className="glass-card p-6 flex flex-col h-full bg-white relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${bgClass}`}>
                        <Award className={`h-5 w-5 ${textClass}`} />
                    </div>
                    <h3 className="font-semibold text-slate-900">Project Completion</h3>
                </div>
                {progressPercent === 100 && (
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-100 px-2 py-1 rounded-full">
                        Completed
                    </span>
                )}
            </div>

            <div className="flex-1 flex flex-col justify-center relative z-10">
                <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-extrabold text-slate-900">{progressPercent.toFixed(0)}</span>
                    <span className="text-lg text-slate-500 font-medium">%</span>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-4 mb-2 overflow-hidden shadow-inner">
                    <div
                        className={`h-4 rounded-full transition-all duration-1000 ease-out ${colorClass} relative overflow-hidden`}
                        style={{ width: `${progressPercent}%` }}
                    >
                        {/* Shimmer effect */}
                        <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/20 -translate-x-full animate-[shimmer_2s_infinite]" />
                    </div>
                </div>
                <p className="text-sm text-slate-500 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    Overall milestone progress
                </p>
            </div>

            {/* Decorative background element */}
            <div className={`absolute -bottom-6 -right-6 w-32 h-32 rounded-full opacity-10 transition-transform group-hover:scale-110 duration-500 ${colorClass}`} />
        </div>
    );
}

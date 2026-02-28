"use client";

import { Upload, CheckCircle2 } from "lucide-react";
import type { Drawing } from "@/types/drawings";

type Props = {
    drawing: Drawing;
};

export default function DrawingActivityLog({ drawing }: Props) {
    const events: { icon: React.ReactNode; label: string; detail: string; color: string }[] = [];

    // Uploaded
    events.push({
        icon: <Upload className="h-3 w-3" />,
        label: "Uploaded",
        detail: `${drawing.uploadedBy?.name || "Unknown"} · ${new Date(drawing.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`,
        color: "text-blue-600 bg-blue-50 border-blue-200",
    });

    // Approved
    if (drawing.approvedAt) {
        events.push({
            icon: <CheckCircle2 className="h-3 w-3" />,
            label: "Approved",
            detail: new Date(drawing.approvedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
            color: "text-emerald-600 bg-emerald-50 border-emerald-200",
        });
    }

    return (
        <div className="space-y-1.5">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Activity</p>
            <div className="space-y-1">
                {events.map((e, i) => (
                    <div key={i} className={`flex items-center gap-2 text-[11px] px-2 py-1 rounded-lg border ${e.color}`}>
                        {e.icon}
                        <span className="font-semibold">{e.label}</span>
                        <span className="ml-auto opacity-70">{e.detail}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

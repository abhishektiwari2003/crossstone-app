"use client";

import { CheckCircle2, XCircle, MinusCircle, FileText, ChevronRight, ImageIcon } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

type InspectionSummary = {
    id: string;
    milestoneName: string;
    status: string;
    submittedAt: string | Date;
    resultSummary: { pass: number; fail: number; na: number };
    engineerName?: string;
    mediaCount?: number;
};

type Props = {
    projectId: string;
    inspections: InspectionSummary[];
};

export default function InspectionHistory({ projectId, inspections }: Props) {
    if (inspections.length === 0) {
        return (
            <div className="glass-card p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 border border-slate-200 shadow-inner">
                    <FileText className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No History Yet</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2">
                    Completed inspections will appear here. Site engineers can start new inspections from the Active Checklists tab.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {inspections.map((insp) => (
                <Link
                    key={insp.id}
                    href={`/projects/${projectId}/inspections/${insp.id}/review`}
                    className="block group"
                >
                    <div className="glass-card hover-lift p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between border-l-4 border-l-transparent hover:border-l-orange-500 transition-all">

                        <div className="space-y-1 sm:max-w-[40%]">
                            <h4 className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                                {insp.milestoneName}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                                <span>{new Date(insp.submittedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                                {insp.engineerName && (
                                    <>
                                        <span>•</span>
                                        <span>By {insp.engineerName}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-6 flex-wrap sm:flex-nowrap">
                            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shadow-inner">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600" title="Passed">
                                    <CheckCircle2 className="h-4 w-4" /> {insp.resultSummary.pass}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-red-600" title="Failed">
                                    <XCircle className="h-4 w-4" /> {insp.resultSummary.fail}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500" title="N/A">
                                    <MinusCircle className="h-4 w-4" /> {insp.resultSummary.na}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold ${insp.status === "REVIEWED"
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-blue-100 text-blue-700"
                                    }`}>
                                    {insp.status}
                                </div>

                                {insp.mediaCount !== undefined && insp.mediaCount > 0 && (
                                    <div className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                                        <ImageIcon className="h-3 w-3" />
                                        {insp.mediaCount}
                                    </div>
                                )}
                            </div>

                            <div className="hidden sm:flex w-8 h-8 rounded-full bg-orange-50 text-orange-600 items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors shrink-0">
                                <ChevronRight className="h-4 w-4" />
                            </div>
                        </div>

                    </div>
                </Link>
            ))}
        </div>
    );
}

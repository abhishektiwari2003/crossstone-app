"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, FileBarChart2 } from "lucide-react";
import { useProjectReport } from "@/hooks/useReports";
import MilestoneProgressChart from "@/components/reports/MilestoneProgressChart";
import InspectionPieChart from "@/components/reports/InspectionPieChart";
import PaymentStatusChart from "@/components/reports/PaymentStatusChart";
import ProjectTimeline from "@/components/reports/ProjectTimeline";

export default function ProjectReportDashboard({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: projectId } = use(params);
    const { report, isLoading, isError } = useProjectReport(projectId);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadPDF = async () => {
        setIsDownloading(true);
        try {
            // Initiate the download by fetching the blob
            const response = await fetch(`/api/projects/${projectId}/report/export?format=pdf`);
            if (!response.ok) throw new Error("Failed to generate PDF");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Project_Report_${projectId}_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Error downloading PDF:", error);
            alert("Failed to download PDF report. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full animate-pulse">
                <div className="h-8 bg-slate-200 rounded w-1/4 mb-8"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <div className="h-[250px] bg-slate-200 lg:col-span-2 rounded-2xl"></div>
                    <div className="h-[250px] bg-slate-200 rounded-2xl"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="h-[300px] bg-slate-200 rounded-2xl"></div>
                    <div className="h-[300px] bg-slate-200 lg:col-span-2 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    if (isError || !report) {
        return (
            <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col items-center justify-center">
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 text-center max-w-md">
                    <FileBarChart2 className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <h2 className="text-lg font-bold mb-1">Failed to load report</h2>
                    <p className="text-sm">We couldn't generate the project report. Please check your connection and try again.</p>
                    <Link href={`/projects/${projectId}`} className="inline-block mt-4 px-4 py-2 bg-white text-red-600 font-semibold rounded-lg shadow-sm hover:bg-red-50 transition-colors">
                        Back to Project
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col min-h-screen">
            {/* Header: Hidden when printing */}
            <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <Link
                        href={`/projects/${projectId}`}
                        className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors shrink-0"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 leading-tight">Project Report</h1>
                        <p className="text-sm text-slate-500">Overview of milestones, inspections, and payments</p>
                    </div>
                </div>

                <button
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isDownloading ? (
                        <>
                            <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Download className="h-4 w-4" />
                            Download PDF
                        </>
                    )}
                </button>
            </div>

            {/* Print Only Header */}
            <div className="hidden print:block mb-8 pb-4 border-b-2 border-slate-200">
                <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Detailed Project Report</h1>
                <p className="text-lg text-slate-600">Generated on {new Date().toLocaleDateString()}</p>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 print:gap-8">

                {/* Top Row */}
                <div className="lg:col-span-2 print:col-span-12 print:break-inside-avoid">
                    <MilestoneProgressChart progressPercent={report.milestoneProgress.progressPercentage} />
                </div>

                <div className="print:col-span-6 print:break-inside-avoid">
                    <InspectionPieChart pass={report.inspectionSummary.passCount} fail={report.inspectionSummary.failCount} />
                </div>

                {/* Bottom Row */}
                <div className="print:col-span-6 print:break-inside-avoid">
                    <PaymentStatusChart total={report.paymentSummary.totalAmount} pending={report.paymentSummary.pendingAmount} />
                </div>

                <div className="lg:col-span-2 print:col-span-12 print:break-inside-avoid print:mt-8">
                    <ProjectTimeline timeline={report.timeline} />
                </div>

            </div>

            {/* Print Media Rules Injection */}
            <style jsx global>{`
                @media print {
                    @page { size: portrait; margin: 1cm; }
                    body { background: white !important; font-size: 12pt; }
                    /* Hide sidebars, floating navs, etc handled globally or here */
                    nav, header, aside, .mobile-bottom-nav { display: none !important; }
                    main { padding: 0 !important; margin: 0 !important; max-width: none !important; min-height: 0 !important; }
                    .glass-card { box-shadow: none !important; border: 1px solid #e2e8f0 !important; break-inside: avoid; }
                    /* Expand timeline inner scroll for print */
                    .custom-scrollbar { overflow: visible !important; max-height: none !important; }
                }
            `}</style>
        </div>
    );
}

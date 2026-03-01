import { FileText, ClipboardCheck, MapPin, Search, HardHat, Building2, FileBarChart2 } from "lucide-react";
import ServiceCard from "./ServiceCard";
import type { UserRole } from "@/types/drawings";

type Props = {
    projectId: string;
    userRole: UserRole;
    drawingCount?: number;
    inspectionCount?: number;
};

export default function ProjectServicesMenu({
    projectId,
    userRole,
    drawingCount,
    inspectionCount,
}: Props) {
    // Role-based visibility rules
    const showReport = userRole === "CLIENT" || userRole === "ADMIN" || userRole === "SUPER_ADMIN" || userRole === "PROJECT_MANAGER";
    const showDrawings = true; // Everyone can see drawings
    const showInspections = true; // Everyone can see inspections (clients read-only handled in route)
    const showQuarries = userRole === "CLIENT" || userRole === "ADMIN" || userRole === "SUPER_ADMIN" || userRole === "PROJECT_MANAGER";
    const showTeam = userRole === "SITE_ENGINEER" || userRole === "ADMIN" || userRole === "SUPER_ADMIN" || userRole === "PROJECT_MANAGER";
    const showContractor = userRole === "ADMIN" || userRole === "SUPER_ADMIN" || userRole === "PROJECT_MANAGER";
    const showLiveTrack = userRole === "ADMIN" || userRole === "SUPER_ADMIN" || userRole === "PROJECT_MANAGER";

    return (
        <div className="mb-8">
            <h2 className="text-lg font-bold text-foreground px-1 mb-4 flex items-center gap-2">
                Project Services
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {/* 1. Project Report */}
                {showReport && (
                    <ServiceCard
                        title="Project Report"
                        description="View visual progress and financial summaries"
                        icon={FileBarChart2}
                        href={`/projects/${projectId}/report`}
                        gradientClass="bg-indigo-100 dark:bg-indigo-900/30 ring-1 ring-indigo-500/20"
                        iconColorClass="text-indigo-600 dark:text-indigo-400"
                    />
                )}

                {/* 2. Design & Documents */}
                {showDrawings && (
                    <ServiceCard
                        title="Design & Docs"
                        description="View project blueprints, drawings, and files"
                        icon={FileText}
                        href={`/projects/${projectId}?tab=drawings`}
                        badge={drawingCount ? `${drawingCount} New` : undefined}
                        gradientClass="bg-blue-100 dark:bg-blue-900/30 ring-1 ring-blue-500/20"
                        iconColorClass="text-blue-600 dark:text-blue-400"
                    />
                )}

                {/* 3. Site Inspections */}
                {showInspections && (
                    <ServiceCard
                        title="Site Inspections"
                        description="Manage QA/QC checklists and milestones"
                        icon={ClipboardCheck}
                        href={`/projects/${projectId}/inspections`}
                        badge={inspectionCount ? "Pending" : undefined}
                        gradientClass="bg-orange-100 dark:bg-orange-900/30 ring-1 ring-orange-500/20"
                        iconColorClass="text-orange-600 dark:text-orange-400"
                    />
                )}

                {/* 4. Live Track (Placeholder) */}
                {showLiveTrack && (
                    <ServiceCard
                        title="Live Track"
                        description="Real-time GPS equipment and drone tracking"
                        icon={MapPin}
                        href="#"
                        gradientClass="bg-emerald-100 dark:bg-emerald-900/30 ring-1 ring-emerald-500/20"
                        iconColorClass="text-emerald-600 dark:text-emerald-400"
                        disabled={true}
                        disabledReason="Integration Coming Soon"
                    />
                )}

                {/* 5. Quarries */}
                {showQuarries && (
                    <ServiceCard
                        title="Quarries & Materials"
                        description="Track material sourcing and quarry logistics"
                        icon={Search}
                        href={`/projects/${projectId}/quarries`}
                        gradientClass="bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-500/20"
                        iconColorClass="text-slate-600 dark:text-slate-400"
                    />
                )}

                {/* 6. Site Engineer Contacts */}
                {showTeam && (
                    <ServiceCard
                        title="Site Team"
                        description="Contact site engineers and project managers"
                        icon={HardHat}
                        href={`/projects/${projectId}?tab=team`}
                        gradientClass="bg-amber-100 dark:bg-amber-900/30 ring-1 ring-amber-500/20"
                        iconColorClass="text-amber-600 dark:text-amber-400"
                    />
                )}

                {/* 7. Contractor Contacts */}
                {showContractor && (
                    <ServiceCard
                        title="Contractors"
                        description="Vendor and third-party contractor details"
                        icon={Building2}
                        href={`/projects/${projectId}/contractors`}
                        gradientClass="bg-purple-100 dark:bg-purple-900/30 ring-1 ring-purple-500/20"
                        iconColorClass="text-purple-600 dark:text-purple-400"
                    />
                )}

            </div>
        </div >
    );
}

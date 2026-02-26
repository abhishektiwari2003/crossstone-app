import { FileText, ClipboardCheck, MapPin, Search, HardHat, Building2 } from "lucide-react";
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
    const showDrawings = true; // Everyone can see drawings
    const showInspections = true; // Everyone can see inspections (clients read-only handled in route)
    const showQuarries = userRole === "CLIENT" || userRole === "ADMIN" || userRole === "SUPER_ADMIN" || userRole === "PROJECT_MANAGER";
    const showTeam = userRole === "SITE_ENGINEER" || userRole === "ADMIN" || userRole === "SUPER_ADMIN" || userRole === "PROJECT_MANAGER";
    const showContractor = userRole === "ADMIN" || userRole === "SUPER_ADMIN" || userRole === "PROJECT_MANAGER";
    const showLiveTrack = userRole === "ADMIN" || userRole === "SUPER_ADMIN" || userRole === "PROJECT_MANAGER";

    return (
        <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-900 px-1 mb-4 flex items-center gap-2">
                Project Services
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">

                {/* 1. Design & Documents */}
                {showDrawings && (
                    <ServiceCard
                        title="Design & Docs"
                        description="View project blueprints, drawings, and files"
                        icon={FileText}
                        href={`/projects/${projectId}?tab=drawings`}
                        badge={drawingCount ? `${drawingCount} New` : undefined}
                        gradientClass="bg-blue-50"
                        iconColorClass="text-blue-600"
                    />
                )}

                {/* 2. Site Inspections */}
                {showInspections && (
                    <ServiceCard
                        title="Site Inspections"
                        description="Manage QA/QC checklists and milestones"
                        icon={ClipboardCheck}
                        href={`/projects/${projectId}/inspections`}
                        badge={inspectionCount ? "Pending" : undefined}
                        gradientClass="bg-orange-50"
                        iconColorClass="text-orange-600"
                    />
                )}

                {/* 3. Live Track (Placeholder) */}
                {showLiveTrack && (
                    <ServiceCard
                        title="Live Track"
                        description="Real-time GPS equipment and drone tracking"
                        icon={MapPin}
                        href="#"
                        gradientClass="bg-emerald-50"
                        iconColorClass="text-emerald-600"
                        disabled={true}
                        disabledReason="Integration Coming Soon"
                    />
                )}

                {/* 4. Quarries */}
                {showQuarries && (
                    <ServiceCard
                        title="Quarries & Materials"
                        description="Track material sourcing and quarry logistics"
                        icon={Search}
                        href={`/projects/${projectId}/quarries`}
                        gradientClass="bg-slate-100"
                        iconColorClass="text-slate-600"
                    />
                )}

                {/* 5. Site Engineer Contacts */}
                {showTeam && (
                    <ServiceCard
                        title="Site Team"
                        description="Contact site engineers and project managers"
                        icon={HardHat}
                        href={`/projects/${projectId}?tab=team`}
                        gradientClass="bg-amber-50"
                        iconColorClass="text-amber-600"
                    />
                )}

                {/* 6. Contractor Contacts */}
                {showContractor && (
                    <ServiceCard
                        title="Contractors"
                        description="Vendor and third-party contractor details"
                        icon={Building2}
                        href={`/projects/${projectId}/contractors`}
                        gradientClass="bg-purple-50"
                        iconColorClass="text-purple-600"
                    />
                )}

            </div>
        </div>
    );
}

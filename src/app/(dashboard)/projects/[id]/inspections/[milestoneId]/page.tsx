import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import InspectionChecklistForm from "@/components/inspection/InspectionChecklistForm";

export default async function InspectionMilestonePage({
    params,
}: {
    params: Promise<{ id: string; milestoneId: string }>;
}) {
    const { id: projectId, milestoneId } = await params;

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: {
            siteLatitude: true,
            siteLongitude: true,
            geofenceRadiusMeters: true,
        },
    });
    if (!project) return notFound();

    const geofenceRequired =
        project.siteLatitude != null &&
        project.siteLongitude != null &&
        !Number.isNaN(project.siteLatitude) &&
        !Number.isNaN(project.siteLongitude);

    return (
        <div className="space-y-6">
            <Link
                href={`/projects/${projectId}/inspections`}
                className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Inspections
            </Link>

            <InspectionChecklistForm
                projectId={projectId}
                milestoneId={milestoneId}
                geofenceRequired={geofenceRequired}
                geofenceRadiusMeters={project.geofenceRadiusMeters}
            />
        </div>
    );
}

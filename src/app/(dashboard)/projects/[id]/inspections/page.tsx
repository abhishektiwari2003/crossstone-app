import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/authz";
import type { Role } from "@/generated/prisma";
import type { AppRole } from "@/lib/authz";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProjectMilestonesManager from "@/components/inspection/ProjectMilestonesManager";
import EngineerMilestoneList from "@/components/inspection/EngineerMilestoneList";

export default async function InspectionsPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as { role?: Role } | null)?.role as AppRole;
    const { id: projectId } = await params;
    const isAdminUser = isAdmin(userRole);

    return (
        <div className="space-y-6">
            <Link
                href={`/projects/${projectId}`}
                className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Project
            </Link>

            {isAdminUser ? (
                <ProjectMilestonesManager projectId={projectId} />
            ) : (
                <EngineerMilestoneList projectId={projectId} />
            )}
        </div>
    );
}

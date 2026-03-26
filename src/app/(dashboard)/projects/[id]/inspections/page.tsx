import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canManageProjectMilestones, type AppRole } from "@/lib/authz";
import type { Role } from "@/generated/prisma";
import Link from "next/link";
import { ArrowLeft, Settings, ClipboardCheck } from "lucide-react";
import ProjectMilestonesManager from "@/components/inspection/ProjectMilestonesManager";
import EngineerMilestoneList from "@/components/inspection/EngineerMilestoneList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function InspectionsPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    const user = session?.user as { id?: string; role?: Role } | null;
    const userRole = user?.role as AppRole | undefined;
    const userId = user?.id;
    const { id: projectId } = await params;

    if (!userId || !userRole) {
        return null;
    }

    const canManageTemplates = await canManageProjectMilestones(userId, userRole, projectId);
    const isEngineer = userRole === "SITE_ENGINEER";

    return (
        <div className="space-y-6">
            <Link
                href={`/projects/${projectId}`}
                className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Project
            </Link>

            {canManageTemplates && isEngineer ? (
                <Tabs defaultValue="manage" className="w-full">
                    <TabsList className="mb-6 h-auto min-h-12 w-full p-1 bg-slate-100 rounded-xl justify-start overflow-x-auto flex-nowrap shrink-0">
                        <TabsTrigger
                            value="manage"
                            className="h-10 px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-orange-600 transition-all font-semibold gap-2"
                        >
                            <Settings className="h-4 w-4" />
                            Manage Templates
                        </TabsTrigger>
                        <TabsTrigger
                            value="execute"
                            className="h-10 px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-orange-600 transition-all font-semibold gap-2"
                        >
                            <ClipboardCheck className="h-4 w-4" />
                            Perform Inspections
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="manage" className="mt-0 outline-none">
                        <ProjectMilestonesManager projectId={projectId} />
                    </TabsContent>

                    <TabsContent value="execute" className="mt-0 outline-none">
                        <EngineerMilestoneList projectId={projectId} />
                    </TabsContent>
                </Tabs>
            ) : canManageTemplates ? (
                <ProjectMilestonesManager projectId={projectId} />
            ) : isEngineer ? (
                <EngineerMilestoneList projectId={projectId} />
            ) : (
                <div className="glass-card p-8 text-center text-sm text-slate-600">
                    You do not have access to manage milestones or perform inspections on this project.
                </div>
            )}
        </div>
    );
}

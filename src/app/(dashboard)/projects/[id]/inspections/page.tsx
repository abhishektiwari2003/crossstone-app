import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/authz";
import type { Role } from "@/generated/prisma";
import type { AppRole } from "@/lib/authz";
import Link from "next/link";
import { ArrowLeft, Settings, ClipboardCheck } from "lucide-react";
import ProjectMilestonesManager from "@/components/inspection/ProjectMilestonesManager";
import EngineerMilestoneList from "@/components/inspection/EngineerMilestoneList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
                <Tabs defaultValue="manage" className="w-full">
                    <TabsList className="mb-6 h-12 w-full sm:w-auto p-1 bg-slate-100 rounded-xl justify-start">
                        <TabsTrigger value="manage" className="h-10 px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-orange-600 transition-all font-semibold gap-2">
                            <Settings className="h-4 w-4" />
                            Manage Templates
                        </TabsTrigger>
                        <TabsTrigger value="execute" className="h-10 px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-orange-600 transition-all font-semibold gap-2">
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
            ) : (
                <EngineerMilestoneList projectId={projectId} />
            )}
        </div>
    );
}

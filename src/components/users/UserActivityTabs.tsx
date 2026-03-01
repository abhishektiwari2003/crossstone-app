"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UserProfileResponse } from "@/types/user-profile";
import UserProjectsList from "./UserProjectsList";
import UserActivityTimeline from "./UserActivityTimeline";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { FolderKanban, Activity } from "lucide-react";

type Props = {
    profile: UserProfileResponse;
};

export default function UserActivityTabs({ profile }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get("tab") || "projects";

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", value);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full mt-6">
            <TabsList className="bg-slate-100/80 p-1.5 rounded-xl h-auto gap-1 flex justify-start w-full overflow-x-auto whitespace-nowrap scrollbar-hide sm:inline-flex sm:w-auto sm:justify-start">
                <TabsTrigger value="projects" className="flex-1 sm:flex-none rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2.5 min-h-[44px] text-sm font-medium flex items-center gap-2">
                    <FolderKanban className="h-4 w-4" />
                    Projects Assigned
                </TabsTrigger>
                <TabsTrigger value="timeline" className="flex-1 sm:flex-none rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2.5 min-h-[44px] text-sm font-medium border border-transparent data-[state=active]:border-indigo-100 data-[state=active]:text-indigo-700 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Activity Timeline
                </TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="mt-6">
                <UserProjectsList projects={profile.projectsAssigned} />
            </TabsContent>

            <TabsContent value="timeline" className="mt-6">
                <UserActivityTimeline timeline={profile.activityTimeline} />
            </TabsContent>
        </Tabs>
    );
}

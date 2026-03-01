import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserProfileData, canViewUserProfile } from "@/modules/users/service";
import type { AppRole } from "@/lib/authz";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import UserProfileHeader from "@/components/users/UserProfileHeader";
import UserStatsCards from "@/components/users/UserStatsCards";
import UserActivityTabs from "@/components/users/UserActivityTabs";
import UserContactCard from "@/components/users/UserContactCard";

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    const currentUser = session?.user as { id: string; role?: string } | undefined;

    if (!currentUser) return notFound();

    const { id } = await params;

    // RBAC Check via Service
    if (!canViewUserProfile({ id: currentUser.id, role: currentUser.role as AppRole }, id)) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="text-red-500 mb-4 bg-red-50 p-4 rounded-full">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                </div>
                <h1 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h1>
                <p className="text-slate-500 max-w-sm">You do not have permission to view other users' detailed profiles.</p>
                <Link href="/dashboard" className="mt-6 text-indigo-600 hover:text-indigo-700 font-medium">Return to Dashboard</Link>
            </div>
        );
    }

    // Since we are inside a Server Component, we can fetch directly from the service
    // instead of making an HTTP call to our own `/api/users/[id]/profile` route to save overhead.
    const profileData = await getUserProfileData(id);

    if (!profileData) return notFound();

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* Back Navigation */}
            <div className="flex items-center gap-4">
                <Link
                    href="/users"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Users List
                </Link>
            </div>

            {/* Top Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <UserProfileHeader user={profileData.user} projectsCount={profileData.statsSummary.totalProjects} />
                </div>

                <div className="lg:col-span-1 space-y-6">
                    {/* Only show contact card if contact data exists */}
                    {(profileData.user.phone || profileData.user.email) && (
                        <UserContactCard email={profileData.user.email} phone={profileData.user.phone} />
                    )}
                </div>
            </div>

            {/* Stats Dashboard */}
            <UserStatsCards stats={profileData.statsSummary} />

            {/* Activity Tabs & Timeline */}
            <div className="glass-card p-6 min-h-[500px]">
                <h2 className="text-lg font-bold text-slate-900 mb-2">Work Activity & Assignments</h2>
                <UserActivityTabs profile={profileData as any} />
            </div>
        </div>
    );
}

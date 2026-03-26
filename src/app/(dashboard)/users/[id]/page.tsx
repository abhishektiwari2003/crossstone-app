import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canViewUserProfile } from "@/modules/users/service";
import type { AppRole } from "@/lib/authz";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import SuperAdminUserActions from "@/components/users/SuperAdminUserActions";

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    const currentUser = session?.user as { id: string; role?: string } | undefined;

    if (!currentUser) return notFound();

    const { id } = await params;

    if (!canViewUserProfile({ id: currentUser.id, role: currentUser.role as AppRole }, id)) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="text-red-500 mb-4 bg-red-50 p-4 rounded-full">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                </div>
                <h1 className="text-xl font-bold text-slate-900 mb-2">Access denied</h1>
                <p className="text-slate-500 max-w-sm">
                    Only a super admin can open user accounts to reset passwords or remove users.
                </p>
                <Link href="/users" className="mt-6 text-indigo-600 hover:text-indigo-700 font-medium">
                    Back to team list
                </Link>
            </div>
        );
    }

    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
        },
    });

    if (!user) return notFound();

    let deleteBlockedReason: string | null = null;
    if (user.id === currentUser.id) {
        deleteBlockedReason = "You cannot delete your own account.";
    } else if (user.role === "SUPER_ADMIN") {
        const superAdminCount = await prisma.user.count({ where: { role: "SUPER_ADMIN" } });
        if (superAdminCount <= 1) {
            deleteBlockedReason = "Cannot delete the last super admin.";
        }
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto pb-12">
            <div className="flex items-center gap-4">
                <Link
                    href="/users"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to team list
                </Link>
            </div>

            <div className="glass-card p-6 border border-slate-200/80">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{user.name}</h1>
                <p className="text-slate-600 mt-1">{user.email}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border bg-slate-50 text-slate-800 border-slate-200">
                        {user.role.replace(/_/g, " ")}
                    </span>
                    <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                            user.isActive
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                    >
                        {user.isActive ? "Active" : "Inactive"}
                    </span>
                </div>
            </div>

            <SuperAdminUserActions
                userId={user.id}
                userName={user.name}
                userEmail={user.email}
                userRole={user.role}
                isActive={user.isActive}
                currentUserId={currentUser.id}
                deleteBlockedReason={deleteBlockedReason}
            />
        </div>
    );
}

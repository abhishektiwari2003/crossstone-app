"use client";

import { Calendar, User as UserIcon, Shield, Briefcase } from "lucide-react";
import type { UserProfileResponse } from "@/types/user-profile";

type Props = {
    user: UserProfileResponse["user"];
    projectsCount: number;
};

export default function UserProfileHeader({ user, projectsCount }: Props) {
    function formatRole(role: string) {
        return role.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    }

    function getRoleBadgeStyle(role: string) {
        switch (role) {
            case "SUPER_ADMIN": return "bg-red-500/10 text-red-500 border border-red-500/20";
            case "ADMIN": return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
            case "PROJECT_MANAGER": return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
            case "SITE_ENGINEER": return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
            default: return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
        }
    }

    return (
        <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-200/60 bg-white">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-8 sm:p-10 relative overflow-hidden">
                {/* Decorative blurs */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px] translate-y-1/4" />

                <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
                    {/* Avatar */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 p-1 shadow-xl shrink-0">
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center border-4 border-slate-900/50">
                            <span className="text-3xl sm:text-4xl font-bold text-white tracking-widest uppercase">
                                {user.name.substring(0, 2)}
                            </span>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-2">
                            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{user.name}</h1>
                            <span className={`inline-flex items-center self-center sm:self-auto px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${getRoleBadgeStyle(user.role)}`}>
                                <Shield className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                                {formatRole(user.role)}
                            </span>
                        </div>

                        {user.designation && (
                            <p className="text-slate-300 text-sm sm:text-base font-medium mb-4 flex items-center justify-center sm:justify-start gap-1.5 opacity-90">
                                <Briefcase className="w-4 h-4 text-orange-400" />
                                {user.designation}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-3 mt-5">
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <Calendar className="h-4 w-4 text-slate-500" />
                                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <UserIcon className="h-4 w-4 text-slate-500" />
                                <span>{projectsCount} active assignments</span>
                            </div>
                            {!user.isActive && (
                                <span className="inline-flex py-0.5 px-2 rounded-md bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/30">
                                    Account Inactive
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

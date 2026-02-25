"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import type { ProjectMember } from "@/types/members";
import RemoveEngineerDialog from "@/components/RemoveEngineerDialog";
import { HardHat, Users } from "lucide-react";

type Props = {
    projectId: string;
    canManageMembers: boolean;
};

export default function ProjectEngineerList({ projectId, canManageMembers }: Props) {
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchMembers = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await fetch(`/api/projects/${projectId}/members`);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setMembers(data.members || []);
        } catch {
            setError(true);
            toast.error("Failed to load team members");
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    function getAvatarGradient(role: string) {
        switch (role) {
            case "SITE_ENGINEER": return "from-amber-500 to-orange-600";
            case "PROJECT_MANAGER": return "from-blue-500 to-cyan-600";
            default: return "from-slate-500 to-slate-600";
        }
    }

    function getRoleBadgeStyle(role: string) {
        switch (role) {
            case "SITE_ENGINEER": return "bg-amber-50 text-amber-700 border-amber-200";
            case "PROJECT_MANAGER": return "bg-blue-50 text-blue-700 border-blue-200";
            default: return "bg-slate-50 text-slate-700 border-slate-200";
        }
    }

    function formatRole(role: string) {
        return role.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    }

    // Loading skeleton
    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="glass-card p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full shimmer" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-32 rounded shimmer" />
                            <div className="h-3 w-48 rounded shimmer" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="glass-card p-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-red-400" />
                </div>
                <p className="text-sm text-slate-500 mb-3">Failed to load team members.</p>
                <button onClick={fetchMembers} className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                    Try again
                </button>
            </div>
        );
    }

    // Empty state
    if (members.length === 0) {
        return (
            <div className="glass-card p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <HardHat className="h-7 w-7 text-slate-400" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">No engineers assigned</h3>
                <p className="text-sm text-slate-500">
                    {canManageMembers
                        ? "Use the selector above to assign site engineers to this project."
                        : "No team members have been assigned to this project yet."}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2.5">
            {members.map(member => (
                <div key={member.id} className="glass-card p-4 flex items-center gap-4 hover-lift group">
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarGradient(member.role)} flex items-center justify-center text-sm font-bold text-white shadow-sm shrink-0`}>
                        {member.user.name?.charAt(0) ?? "U"}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 text-sm truncate">{member.user.name || "Unknown"}</div>
                        <div className="text-xs text-slate-500 truncate">{member.user.email}</div>
                    </div>

                    {/* Role badge */}
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold border shrink-0 ${getRoleBadgeStyle(member.role)}`}>
                        {formatRole(member.role)}
                    </span>

                    {/* Remove button (admin only) */}
                    {canManageMembers && (
                        <RemoveEngineerDialog
                            projectId={projectId}
                            memberId={member.id}
                            memberName={member.user.name}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}

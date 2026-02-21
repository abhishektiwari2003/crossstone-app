import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/authz";
import type { Role } from "@/generated/prisma";
import { cookies } from "next/headers";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { Plus, Shield, ArrowRight, Users as UsersIcon } from "lucide-react";

type UserSummary = { id: string; name: string; email: string; role: Role };

async function getUsers(cookie: string): Promise<{ users: UserSummary[] }> {
	const res = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/users`, { headers: { cookie }, cache: "no-store" });
	return res.json();
}

function getRoleBadgeStyle(role: string) {
	switch (role) {
		case "SUPER_ADMIN": return "bg-red-50 text-red-700 border-red-200";
		case "ADMIN": return "bg-purple-50 text-purple-700 border-purple-200";
		case "PROJECT_MANAGER": return "bg-blue-50 text-blue-700 border-blue-200";
		case "SITE_ENGINEER": return "bg-amber-50 text-amber-700 border-amber-200";
		case "CLIENT": return "bg-emerald-50 text-emerald-700 border-emerald-200";
		default: return "bg-slate-50 text-slate-700 border-slate-200";
	}
}

function getAvatarGradient(role: string) {
	switch (role) {
		case "SUPER_ADMIN": return "from-red-500 to-orange-600";
		case "ADMIN": return "from-purple-500 to-pink-600";
		case "PROJECT_MANAGER": return "from-blue-500 to-cyan-600";
		case "SITE_ENGINEER": return "from-amber-500 to-orange-600";
		case "CLIENT": return "from-emerald-500 to-teal-600";
		default: return "from-slate-500 to-slate-600";
	}
}

function formatRole(role: string) {
	return role.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

export default async function UsersPage() {
	const session = await getServerSession(authOptions);
	if (!isAdmin((session?.user as { role?: Role } | null)?.role)) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<div className="glass-card p-12 text-center max-w-sm">
					<div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
						<Shield className="h-8 w-8 text-red-500" />
					</div>
					<h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
					<p className="text-sm text-slate-500 mb-5">You don&apos;t have permission to view this page.</p>
					<Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl gradient-blue px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25">
						Back to Dashboard
					</Link>
				</div>
			</div>
		);
	}
	const cookieStore = await cookies();
	const cookie = cookieStore.toString();
	const { users } = await getUsers(cookie);
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-slate-900 tracking-tight">Team Members</h1>
					<p className="text-sm text-slate-500 mt-0.5">{users?.length ?? 0} total members</p>
				</div>
				<Link
					href="/users/new"
					className="inline-flex items-center gap-2 rounded-xl gradient-blue px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:brightness-110 transition-all"
				>
					<Plus className="h-4 w-4" />
					New User
				</Link>
			</div>
			<div className="grid gap-3">
				{users?.length ? users.map((u) => (
					<div key={u.id} className="glass-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 hover-lift group">
						<div className="flex items-center gap-4 min-w-0">
							<Avatar className="h-11 w-11 ring-2 ring-white shadow-md">
								<AvatarFallback className={`bg-gradient-to-br ${getAvatarGradient(u.role)} text-white font-bold text-sm`}>
									{u.name?.slice(0, 1) || "U"}
								</AvatarFallback>
							</Avatar>
							<div className="min-w-0">
								<div className="font-semibold text-slate-900 truncate">{u.name}</div>
								<div className="text-sm text-slate-500 truncate">{u.email}</div>
							</div>
						</div>
						<div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
							<span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getRoleBadgeStyle(u.role)}`}>
								{formatRole(u.role)}
							</span>
							<ArrowRight className="h-4 w-4 text-slate-300 opacity-0 sm:group-hover:opacity-100 transition-opacity hidden sm:block" />
						</div>
					</div>
				)) : (
					<div className="glass-card p-12 text-center">
						<div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
							<UsersIcon className="h-8 w-8 text-slate-400" />
						</div>
						<h3 className="text-lg font-semibold text-slate-900 mb-1">No users yet</h3>
						<p className="text-sm text-slate-500 mb-4">Add your first team member.</p>
						<Link
							href="/users/new"
							className="inline-flex items-center gap-2 rounded-xl gradient-blue px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25"
						>
							<Plus className="h-4 w-4" />
							Add User
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}

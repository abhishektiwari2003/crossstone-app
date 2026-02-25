import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canManageProjects } from "@/lib/authz";
import { cookies } from "next/headers";
import Link from "next/link";
import { FolderKanban, Plus, ArrowRight, HardHat } from "lucide-react";

type ProjectListItem = { id: string; name: string; status: string; description?: string | null; members?: { id: string; user: { id: string; name: string | null } }[] };

async function getProjects(cookie: string): Promise<{ projects: ProjectListItem[] }> {
	const res = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/projects`, { headers: { cookie }, cache: "no-store" });
	return res.json();
}

function getStatusStyle(status: string) {
	switch (status) {
		case "PLANNED": return "status-planned";
		case "IN_PROGRESS": return "status-in-progress";
		case "ON_HOLD": return "status-on-hold";
		case "COMPLETED": return "status-completed";
		default: return "status-pending";
	}
}

function getStatusBorderColor(status: string) {
	switch (status) {
		case "PLANNED": return "border-l-purple-500";
		case "IN_PROGRESS": return "border-l-blue-500";
		case "ON_HOLD": return "border-l-amber-500";
		case "COMPLETED": return "border-l-emerald-500";
		default: return "border-l-slate-400";
	}
}

function formatStatus(status: string) {
	return status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

export default async function ProjectsPage() {
	const session = await getServerSession(authOptions);
	const cookieStore = await cookies();
	const cookie = cookieStore.toString();
	const { projects } = await getProjects(cookie);
	const isAdmin = canManageProjects((session?.user as { role?: "SUPER_ADMIN" | "ADMIN" | "PROJECT_MANAGER" | "SITE_ENGINEER" | "CLIENT" } | null)?.role);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-slate-900 tracking-tight">Projects</h1>
					<p className="text-sm text-slate-500 mt-0.5">{projects?.length ?? 0} total projects</p>
				</div>
				{isAdmin ? (
					<Link
						href="/projects/new"
						className="inline-flex items-center gap-2 rounded-xl gradient-blue px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:brightness-110 transition-all"
					>
						<Plus className="h-4 w-4" />
						New Project
					</Link>
				) : null}
			</div>

			{/* Projects Grid */}
			<div className="grid gap-4">
				{projects?.length ? projects.map((p) => (
					<Link key={p.id} href={`/projects/${p.id}`}>
						<div className={`glass-card hover-lift border-l-4 ${getStatusBorderColor(p.status)} p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 group`}>
							<div className="flex items-center gap-4 min-w-0">
								<div className="flex items-center justify-center w-11 h-11 rounded-xl bg-slate-100 shrink-0">
									<FolderKanban className="h-5 w-5 text-slate-600" />
								</div>
								<div className="min-w-0">
									<div className="font-semibold text-slate-900 truncate">{p.name}</div>
									{p.description && (
										<div className="text-sm text-slate-500 truncate max-w-md mt-0.5">{p.description}</div>
									)}
								</div>
							</div>
							<div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
								{(p.members?.length ?? 0) > 0 && (
									<span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold">
										<HardHat className="h-3 w-3" />
										{p.members!.length} {p.members!.length === 1 ? "Engineer" : "Engineers"}
									</span>
								)}
								<span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(p.status)}`}>
									{formatStatus(p.status)}
								</span>
								<ArrowRight className="h-4 w-4 text-slate-400 opacity-0 -translate-x-1 sm:group-hover:opacity-100 sm:group-hover:translate-x-0 transition-all hidden sm:block" />
							</div>
						</div>
					</Link>
				)) : (
					<div className="glass-card p-12 text-center">
						<div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
							<FolderKanban className="h-8 w-8 text-slate-400" />
						</div>
						<h3 className="text-lg font-semibold text-slate-900 mb-1">No projects yet</h3>
						<p className="text-sm text-slate-500 mb-4">Get started by creating your first project.</p>
						{isAdmin && (
							<Link
								href="/projects/new"
								className="inline-flex items-center gap-2 rounded-xl gradient-blue px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25"
							>
								<Plus className="h-4 w-4" />
								Create Project
							</Link>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

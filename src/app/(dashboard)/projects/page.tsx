import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canManageProjects, type AppRole } from "@/lib/authz";
import Link from "next/link";
import { FolderKanban, Plus, ArrowRight, HardHat } from "lucide-react";
import { getProjectsForUser } from "@/modules/projects/service";

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
	if (!session?.user) return null;
	const role = (session.user as { role?: AppRole }).role as AppRole;
	const userId = (session.user as { id: string }).id;
	const projects = await getProjectsForUser(userId, role);
	const isAdmin = canManageProjects(role);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-foreground tracking-tight">Projects</h1>
					<p className="text-sm text-muted-foreground mt-0.5">{projects?.length ?? 0} total projects</p>
				</div>
				{isAdmin ? (
					<Link
						href="/projects/new"
						className="hidden sm:inline-flex items-center gap-2 rounded-xl gradient-blue px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:brightness-110 transition-all shrink-0"
					>
						<Plus className="h-4 w-4" />
						<span>New Project</span>
					</Link>
				) : null}
			</div>

			{/* Projects Grid */}
			<div className="grid gap-4">
				{projects?.length ? projects.map((p) => (
					<Link key={p.id} href={`/projects/${p.id}`} className="block min-w-0">
						<div className={`glass-card hover-lift border-l-4 ${getStatusBorderColor(p.status)} p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 group`}>
							<div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
								<div className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-muted shrink-0 shadow-inner mt-0.5 sm:mt-0">
									<FolderKanban className="h-5 w-5 text-muted-foreground" />
								</div>
								<div className="min-w-0 flex-1">
									<div className="font-semibold text-foreground text-[15px] sm:text-base truncate leading-tight">{p.name}</div>
									{p.description && (
										<div className="text-sm text-muted-foreground truncate mt-1">{p.description}</div>
									)}
								</div>
							</div>
							<div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0 ml-12 sm:ml-0">
								{(p.members?.length ?? 0) > 0 && (
									<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 text-[11px] font-semibold">
										<HardHat className="h-3 w-3" />
										{p.members!.length} {p.members!.length === 1 ? "Engineer" : "Engineers"}
									</span>
								)}
								<span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold ${getStatusStyle(p.status)}`}>
									{formatStatus(p.status)}
								</span>
								<ArrowRight className="h-4 w-4 text-slate-400 opacity-0 -translate-x-1 sm:group-hover:opacity-100 sm:group-hover:translate-x-0 transition-all hidden sm:block" />
							</div>
						</div>
					</Link>
				)) : (
					<div className="glass-card p-12 text-center">
						<div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4 shadow-inner">
							<FolderKanban className="h-8 w-8 text-muted-foreground" />
						</div>
						<h3 className="text-lg font-semibold text-foreground mb-1">No projects yet</h3>
						<p className="text-sm text-muted-foreground mb-4">Get started by creating your first project.</p>
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

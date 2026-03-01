import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Role } from "@/generated/prisma";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FolderKanban, CreditCard, Users, TrendingUp, ArrowRight, Activity } from "lucide-react";
import EngineerHome from "@/components/EngineerHome";

export default async function DashboardPage() {
	const session = await getServerSession(authOptions);
	const user = session?.user as { id?: string; name?: string | null; role?: Role } | null;
	const role = user?.role;
	const firstName = user?.name?.split(" ")[0] ?? "User";

	// If site engineer, show the mobile-optimized Engineer Home instead
	if (role === "SITE_ENGINEER" && user?.id) {
		const assignedProjects = await prisma.project.findMany({
			where: { members: { some: { userId: user.id } } },
			select: { id: true, name: true, status: true },
			take: 5
		});
		return <EngineerHome firstName={firstName} projects={assignedProjects} />;
	}

	// Fetch summary counts (Admin & generic view)
	const [projectCount, activeProjectCount, paymentCount, userCount] = await Promise.all([
		prisma.project.count(),
		prisma.project.count({ where: { status: "IN_PROGRESS" } }),
		prisma.payment.count(),
		prisma.user.count(),
	]);

	const kpiCards = [
		{
			label: "Total Projects",
			value: projectCount,
			icon: FolderKanban,
			gradient: "gradient-blue",
			shadow: "shadow-blue-500/20",
		},
		{
			label: "Active Projects",
			value: activeProjectCount,
			icon: Activity,
			gradient: "gradient-emerald",
			shadow: "shadow-emerald-500/20",
		},
		{
			label: "Payments",
			value: paymentCount,
			icon: CreditCard,
			gradient: "gradient-purple",
			shadow: "shadow-purple-500/20",
		},
		{
			label: "Team Members",
			value: userCount,
			icon: Users,
			gradient: "gradient-orange",
			shadow: "shadow-orange-500/20",
		},
	];

	return (
		<div className="space-y-8">
			{/* Welcome Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-foreground tracking-tight">
						Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {firstName} 👋
					</h1>
					<p className="text-muted-foreground mt-1">Here&apos;s what&apos;s happening with your projects today.</p>
				</div>
			</div>

			{/* KPI Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
				{kpiCards.map((card) => (
					<div
						key={card.label}
						className={`${card.gradient} rounded-2xl p-5 shadow-lg ${card.shadow} hover-lift`}
					>
						<div className="flex items-center justify-between mb-4">
							<div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
								<card.icon className="h-5 w-5 text-white" />
							</div>
							<TrendingUp className="h-4 w-4 text-white/60" />
						</div>
						<div className="text-3xl font-bold text-white">{card.value}</div>
						<div className="text-sm text-white/70 mt-1 font-medium">{card.label}</div>
					</div>
				))}
			</div>

			{/* Quick Actions */}
			<div>
				<h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<Link
						href="/projects"
						className="glass-card p-5 hover-lift group flex items-center justify-between"
					>
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center ring-1 ring-blue-500/20">
								<FolderKanban className="h-5 w-5 text-blue-600 dark:text-blue-400" />
							</div>
							<div>
								<div className="font-semibold text-foreground">View Projects</div>
								<div className="text-xs text-muted-foreground">Manage all projects</div>
							</div>
						</div>
						<ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
					</Link>
					<Link
						href="/payments"
						className="glass-card p-5 hover-lift group flex items-center justify-between"
					>
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center ring-1 ring-purple-500/20">
								<CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
							</div>
							<div>
								<div className="font-semibold text-foreground">Payments</div>
								<div className="text-xs text-muted-foreground">Track finances</div>
							</div>
						</div>
						<ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
					</Link>
					{(role === "SUPER_ADMIN" || role === "ADMIN") && (
						<Link
							href="/users"
							className="glass-card p-5 hover-lift group flex items-center justify-between"
						>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center ring-1 ring-orange-500/20">
									<Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
								</div>
								<div>
									<div className="font-semibold text-foreground">Team</div>
									<div className="text-xs text-muted-foreground">Manage users</div>
								</div>
							</div>
							<ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
						</Link>
					)}
				</div>
			</div>

			{/* Role Info */}
			<div className="glass-card p-5 flex items-center gap-4">
				<div className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center shadow-inner">
					<span className="text-lg">🛡️</span>
				</div>
				<div>
					<div className="text-sm font-semibold text-foreground">Your Role</div>
					<div className="text-sm text-muted-foreground font-medium">{role?.replace(/_/g, " ")}</div>
				</div>
			</div>
		</div>
	);
}

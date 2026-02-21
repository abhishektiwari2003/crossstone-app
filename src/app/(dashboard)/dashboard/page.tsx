import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Role } from "@/generated/prisma";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FolderKanban, CreditCard, Users, TrendingUp, ArrowRight, Activity } from "lucide-react";

export default async function DashboardPage() {
	const session = await getServerSession(authOptions);
	const user = session?.user as { name?: string | null; role?: Role } | null;
	const role = user?.role;
	const firstName = user?.name?.split(" ")[0] ?? "User";

	// Fetch summary counts
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
					<h1 className="text-3xl font-bold text-slate-900 tracking-tight">
						Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {firstName} 👋
					</h1>
					<p className="text-slate-500 mt-1">Here&apos;s what&apos;s happening with your projects today.</p>
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
				<h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<Link
						href="/projects"
						className="glass-card p-5 hover-lift group flex items-center justify-between"
					>
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
								<FolderKanban className="h-5 w-5 text-blue-600" />
							</div>
							<div>
								<div className="font-semibold text-slate-900">View Projects</div>
								<div className="text-xs text-slate-500">Manage all projects</div>
							</div>
						</div>
						<ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
					</Link>
					<Link
						href="/payments"
						className="glass-card p-5 hover-lift group flex items-center justify-between"
					>
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
								<CreditCard className="h-5 w-5 text-purple-600" />
							</div>
							<div>
								<div className="font-semibold text-slate-900">Payments</div>
								<div className="text-xs text-slate-500">Track finances</div>
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
								<div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
									<Users className="h-5 w-5 text-orange-600" />
								</div>
								<div>
									<div className="font-semibold text-slate-900">Team</div>
									<div className="text-xs text-slate-500">Manage users</div>
								</div>
							</div>
							<ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
						</Link>
					)}
				</div>
			</div>

			{/* Role Info */}
			<div className="glass-card p-5 flex items-center gap-4">
				<div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
					<span className="text-lg">🛡️</span>
				</div>
				<div>
					<div className="text-sm font-medium text-slate-900">Your Role</div>
					<div className="text-sm text-slate-500">{role?.replace(/_/g, " ")}</div>
				</div>
			</div>
		</div>
	);
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Role } from "@/generated/prisma";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FolderKanban, CreditCard, Users, TrendingUp, ArrowRight, Activity, MessageSquare, FileText } from "lucide-react";
import RoleDashboard from "@/components/dashboard/RoleDashboard";
import type { ActivityItem } from "@/components/dashboard/RecentActivityTimeline";

export default async function DashboardPage() {
	const session = await getServerSession(authOptions);
	const user = session?.user as { id?: string; name?: string | null; role?: Role } | null;
	const role = user?.role;
	const firstName = user?.name?.split(" ")[0] ?? "User";

	if (!user?.id || !role) return null;

	const isAdminRole = role === "SUPER_ADMIN" || role === "ADMIN";
	const isClient = role === "CLIENT";
	const isEngineer = role === "SITE_ENGINEER";

	// 1. Fetch Projects for Progress Overview
	const projectWhereObj = isClient
		? { clientId: user.id }
		: isEngineer
			? { members: { some: { userId: user.id } } }
			: {};

	const projectsData = await prisma.project.findMany({
		where: projectWhereObj,
		select: {
			id: true,
			name: true,
			status: true,
			client: { select: { id: true, name: true } },
			manager: { select: { id: true, name: true } },
			milestones: { select: { id: true, checklistItems: { select: { responses: { select: { result: true } } } } } }
		},
		orderBy: { updatedAt: "desc" },
		take: 6,
	});

	const projects = projectsData.map(p => {
		// Calculate simple milestone progress (assuming each milestone counts as 1 for simplicity if it has any pass response)
		const totalMilestones = p.milestones.length;
		const completedMilestones = p.milestones.filter(m => m.checklistItems.some(item => item.responses.some(r => r.result === "PASS"))).length;
		const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

		return {
			id: p.id,
			name: p.name,
			clientId: p.client?.id,
			clientName: p.client?.name,
			managerName: p.manager?.name,
			status: p.status,
			progress,
			totalMilestones,
			completedMilestones,
		};
	});

	// 2. Fetch Payments for Overview Pie Chart & KPI
	const paymentWhereObj = isClient
		? { project: { clientId: user.id } }
		: isEngineer || role === "PROJECT_MANAGER"
			? { project: { OR: [{ managerId: user.id }, { members: { some: { userId: user.id } } }] } }
			: {};

	const paymentsList = await prisma.payment.findMany({
		where: paymentWhereObj,
		select: { amount: true, status: true },
	});

	let totalPaid = 0, totalPending = 0, totalOverdue = 0;
	paymentsList.forEach(p => {
		const amt = Number(p.amount);
		if (p.status === "PAID") totalPaid += amt;
		else if (p.status === "OVERDUE") totalOverdue += amt;
		else if (p.status === "PENDING" || p.status === "PARTIAL") totalPending += amt;
	});

	// 3. Fetch Recent Activity (Audit Logs)
	const auditWhereObj = isAdminRole ? {} : { projectId: { in: projects.map(p => p.id) } };
	const logs = await prisma.auditLog.findMany({
		where: auditWhereObj,
		include: { user: { select: { name: true } } },
		orderBy: { createdAt: "desc" },
		take: 5,
	});

	const activities: ActivityItem[] = logs.map(log => {
		const isPayment = log.entity === "Payment";
		const isQuery = log.entity === "Query";
		const isDoc = log.entity === "Media" || log.entity === "Drawing";
		const isUser = log.entity === "User" || log.entity === "ProjectMember";

		const type = isPayment ? "PAYMENT" : isQuery ? "QUERY" : isDoc ? "DOCUMENT" : isUser ? "USER" : "SYSTEM";

		return {
			id: log.id,
			type,
			title: log.action || "System Event",
			description: `${log.user?.name || "System"} modified ${log.entity}`,
			time: new Date(log.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
			status: log.action.toLowerCase().includes("delete") || log.action.toLowerCase().includes("fail") ? "warning" : "success"
		};
	});

	// 4. Fetch additional KPI counts (queries, team)
	const [allProjectsCount, activeProjectsCount, openQueriesCount, teamCount] = await Promise.all([
		prisma.project.count({ where: projectWhereObj }),
		prisma.project.count({ where: { ...projectWhereObj, status: "IN_PROGRESS" } }),
		isClient ? prisma.query.count({ where: { authorId: user.id, status: { not: "RESOLVED" } } }) : 0,
		isAdminRole ? prisma.user.count({ where: { isActive: true } }) : 0
	]);

	// Construct KPI Array based on Role
	const kpis = [];

	if (isClient) {
		kpis.push({ label: "My Projects", value: allProjectsCount, trend: 0, icon: "FolderKanban", gradient: "gradient-blue", chartData: [] });
		kpis.push({ label: "Active", value: activeProjectsCount, trend: 5, icon: "Activity", gradient: "gradient-emerald", chartData: [] });
		kpis.push({ label: "Open Queries", value: openQueriesCount, trend: -2, icon: "MessageSquare", gradient: "gradient-orange", chartData: [] });
	} else if (isEngineer) {
		kpis.push({ label: "Assigned Projects", value: allProjectsCount, trend: 0, icon: "FolderKanban", gradient: "gradient-blue", chartData: [] });
		kpis.push({ label: "Active", value: activeProjectsCount, trend: 0, icon: "Activity", gradient: "gradient-emerald", chartData: [] });
	} else {
		// Admin / PM
		kpis.push({ label: "Total Projects", value: allProjectsCount, trend: 12, icon: "FolderKanban", gradient: "gradient-blue", chartData: [] });
		kpis.push({ label: "Active", value: activeProjectsCount, trend: 8, icon: "Activity", gradient: "gradient-emerald", chartData: [] });
		kpis.push({ label: "Total Payments", value: paymentsList.length, trend: 15, icon: "CreditCard", gradient: "gradient-purple", chartData: [] });
		if (isAdminRole) {
			kpis.push({ label: "Team Members", value: teamCount, trend: 0, icon: "Users", gradient: "gradient-orange", chartData: [] });
		}
	}

	return (
		<RoleDashboard
			role={role}
			userName={firstName}
			kpis={kpis}
			projects={projects}
			payments={{ totalPaid, totalPending, totalOverdue }}
			activities={activities}
		/>
	);
}


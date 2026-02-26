import { cookies } from "next/headers";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Role } from "@/generated/prisma";
import { CreditCard, TrendingUp, Clock, AlertTriangle } from "lucide-react";

type PaymentListItem = { id: string; amount: string; currency: string; status: string; project?: { id: string; name: string; client?: { id: string; name: string; email: string } } };

async function getPayments(cookie: string): Promise<{ payments: PaymentListItem[] }> {
	const res = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/payments`, { headers: { cookie }, cache: "no-store" });
	return res.json();
}

function getPaymentStatusStyle(status: string) {
	switch (status) {
		case "PAID": return "status-paid";
		case "PARTIAL": return "status-partial";
		case "OVERDUE": return "status-overdue";
		case "PENDING": return "status-pending";
		default: return "status-pending";
	}
}

function formatStatus(status: string) {
	return status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

export default async function PaymentsPage() {
	const cookieStore = await cookies();
	const cookie = cookieStore.toString();
	const session = await getServerSession(authOptions);
	const role = (session?.user as { role?: Role } | null)?.role;
	const { payments } = await getPayments(cookie);

	const showMaster = role === "SUPER_ADMIN" || role === "ADMIN" || role === "PROJECT_MANAGER";

	// Calculate summary
	const totalAmount = payments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;
	const paidAmount = payments?.filter(p => p.status === "PAID").reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;
	const pendingAmount = payments?.filter(p => p.status === "PENDING").reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;
	const overdueAmount = payments?.filter(p => p.status === "OVERDUE").reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;

	const summaryCards = [
		{ label: "Total", value: totalAmount, icon: CreditCard, gradient: "gradient-blue", shadow: "shadow-blue-500/20" },
		{ label: "Paid", value: paidAmount, icon: TrendingUp, gradient: "gradient-emerald", shadow: "shadow-emerald-500/20" },
		{ label: "Pending", value: pendingAmount, icon: Clock, gradient: "gradient-amber", shadow: "shadow-amber-500/20" },
		{ label: "Overdue", value: overdueAmount, icon: AlertTriangle, gradient: "gradient-red", shadow: "shadow-red-500/20" },
	];

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payments</h1>
				<p className="text-sm text-slate-500 mt-0.5">{payments?.length ?? 0} total transactions</p>
			</div>

			{/* Summary KPI Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{summaryCards.map((card) => (
					<div key={card.label} className={`${card.gradient} rounded-2xl p-4 shadow-lg ${card.shadow}`}>
						<div className="flex items-center gap-2 mb-2">
							<div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
								<card.icon className="h-4 w-4 text-white" />
							</div>
						</div>
						<div className="text-xl font-bold text-white">₹{card.value.toLocaleString()}</div>
						<div className="text-xs text-white/70 font-medium mt-0.5">{card.label}</div>
					</div>
				))}
			</div>

			{/* Desktop Payments Table */}
			<div className="hidden md:block glass-card overflow-hidden">
				<div className="w-full overflow-x-auto">
					<Table>
						{showMaster ? <TableCaption className="pb-4">All payments across projects</TableCaption> : <TableCaption className="pb-4">Your project payments</TableCaption>}
						<TableHeader>
							<TableRow className="border-slate-200/60 hover:bg-transparent">
								<TableHead className="font-semibold text-slate-600">Amount</TableHead>
								<TableHead className="font-semibold text-slate-600">Status</TableHead>
								{showMaster ? <TableHead className="font-semibold text-slate-600">Project</TableHead> : null}
								{showMaster ? <TableHead className="font-semibold text-slate-600">Client</TableHead> : null}
								<TableHead className="text-right font-semibold text-slate-600">Currency</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{payments?.length ? payments.map((p) => (
								<TableRow key={p.id} className="border-slate-200/60 hover:bg-slate-50/50 transition-colors">
									<TableCell className="font-bold text-slate-900">₹{Number(p.amount).toLocaleString()}</TableCell>
									<TableCell>
										<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getPaymentStatusStyle(p.status)}`}>
											{formatStatus(p.status)}
										</span>
									</TableCell>
									{showMaster ? <TableCell className="max-w-[200px] truncate text-slate-600">{p.project?.name}</TableCell> : null}
									{showMaster ? <TableCell className="max-w-[200px] truncate text-slate-600">{p.project?.client?.name}</TableCell> : null}
									<TableCell className="text-right text-slate-600">{p.currency}</TableCell>
								</TableRow>
							)) : (
								<TableRow>
									<TableCell colSpan={showMaster ? 5 : 3} className="text-center py-12">
										<div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
											<CreditCard className="h-6 w-6 text-slate-400" />
										</div>
										<p className="text-sm text-slate-500">No payments yet.</p>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>

			{/* Mobile Payments Cards */}
			<div className="grid gap-3 md:hidden">
				{payments?.length ? payments.map((p) => (
					<div key={p.id} className="glass-card p-4 flex flex-col gap-3">
						<div className="flex items-center justify-between">
							<div className="font-bold text-slate-900 text-base">₹{Number(p.amount).toLocaleString()}</div>
							<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getPaymentStatusStyle(p.status)}`}>
								{formatStatus(p.status)}
							</span>
						</div>
						{showMaster && (
							<div className="space-y-0.5">
								<p className="text-sm font-medium text-slate-700 truncate">{p.project?.name}</p>
								<p className="text-xs text-slate-500 truncate">{p.project?.client?.name}</p>
							</div>
						)}
						<div className="text-[11px] text-slate-400 font-medium">
							{p.currency}
						</div>
					</div>
				)) : (
					<div className="glass-card p-8 text-center space-y-3">
						<div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto">
							<CreditCard className="h-6 w-6 text-slate-400" />
						</div>
						<p className="text-sm text-slate-500">No payments yet.</p>
					</div>
				)}
			</div>
		</div>
	);
}

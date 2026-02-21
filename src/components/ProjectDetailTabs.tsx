"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddProjectUpdate from "@/components/AddProjectUpdate";
import AddPayment from "@/components/AddPayment";
import ViewMediaLink from "@/components/ViewMediaLink";
import { User, CreditCard, FileText, Clock } from "lucide-react";

type Update = {
	id: string;
	createdAt: string;
	notes: string;
	author?: { name?: string | null } | null;
	media: { id: string; fileKey: string }[];
};

type Payment = {
	id: string;
	amount: string;
	currency: string;
	status: string;
	createdAt: string;
	media: { id: string; fileKey: string }[];
};

type Props = {
	projectId: string;
	name: string;
	description?: string | null;
	status: string;
	createdAt: string;
	manager?: { name?: string | null } | null;
	client?: { name?: string | null } | null;
	updates: Update[];
	payments: Payment[];
	canEditUpdates: boolean;
	canEditPayments: boolean;
};

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

export default function ProjectDetailTabs(props: Props) {
	return (
		<Tabs defaultValue="overview" className="w-full">
			<TabsList className="bg-slate-100/80 p-1 rounded-xl h-auto gap-1">
				<TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2 text-sm font-medium">Overview</TabsTrigger>
				<TabsTrigger value="updates" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2 text-sm font-medium">Updates</TabsTrigger>
				<TabsTrigger value="payments" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2 text-sm font-medium">Payments</TabsTrigger>
			</TabsList>

			{/* ─── Overview Tab ─── */}
			<TabsContent value="overview" className="space-y-4 mt-6">
				<div className="grid sm:grid-cols-3 gap-4">
					<div className="glass-card p-5">
						<div className="flex items-center gap-2 mb-3">
							<div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
								<User className="h-4 w-4 text-blue-600" />
							</div>
							<span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Manager</span>
						</div>
						<div className="font-semibold text-slate-900">{props.manager?.name ?? "—"}</div>
					</div>
					<div className="glass-card p-5">
						<div className="flex items-center gap-2 mb-3">
							<div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
								<User className="h-4 w-4 text-purple-600" />
							</div>
							<span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Client</span>
						</div>
						<div className="font-semibold text-slate-900">{props.client?.name ?? "—"}</div>
					</div>
					<div className="glass-card p-5">
						<div className="flex items-center gap-2 mb-3">
							<div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
								<Clock className="h-4 w-4 text-emerald-600" />
							</div>
							<span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Created</span>
						</div>
						<div className="font-semibold text-slate-900">{new Date(props.createdAt).toLocaleDateString()}</div>
					</div>
				</div>
				{props.description && (
					<div className="glass-card p-5">
						<h3 className="text-sm font-semibold text-slate-900 mb-2">Description</h3>
						<p className="text-sm text-slate-600 leading-relaxed">{props.description}</p>
					</div>
				)}
			</TabsContent>

			{/* ─── Updates Tab ─── */}
			<TabsContent value="updates" className="space-y-4 mt-6">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold text-slate-900">Site Updates</h2>
					{props.canEditUpdates ? <AddProjectUpdate projectId={props.projectId} /> : null}
				</div>
				<div className="space-y-3">
					{props.updates.length ? props.updates.map(u => (
						<div key={u.id} className="glass-card p-5 hover-lift">
							<div className="flex items-center gap-3 mb-3">
								<div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
									{u.author?.name?.charAt(0) ?? "U"}
								</div>
								<div>
									<span className="text-sm font-semibold text-slate-900">{u.author?.name ?? "Unknown"}</span>
									<span className="text-xs text-slate-400 ml-2">{new Date(u.createdAt).toLocaleDateString()}</span>
								</div>
							</div>
							<p className="text-sm text-slate-700 leading-relaxed">{u.notes}</p>
							{u.media?.length ? (
								<div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
									{u.media.map(m => (
										<ViewMediaLink key={m.id} fileKey={m.fileKey} />
									))}
								</div>
							) : null}
						</div>
					)) : (
						<div className="glass-card p-8 text-center">
							<div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
								<FileText className="h-6 w-6 text-slate-400" />
							</div>
							<p className="text-sm text-slate-500">No updates yet.</p>
						</div>
					)}
				</div>
			</TabsContent>

			{/* ─── Payments Tab ─── */}
			<TabsContent value="payments" className="space-y-4 mt-6">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold text-slate-900">Payment History</h2>
					{props.canEditPayments ? <AddPayment projectId={props.projectId} /> : null}
				</div>
				<div className="space-y-3">
					{props.payments.length ? props.payments.map(p => (
						<div key={p.id} className="glass-card p-5 hover-lift">
							<div className="flex items-center justify-between mb-2">
								<div className="flex items-center gap-3">
									<div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
										<CreditCard className="h-4 w-4 text-emerald-600" />
									</div>
									<div>
										<div className="font-bold text-slate-900 text-lg">{p.currency} {Number(p.amount).toLocaleString()}</div>
									</div>
								</div>
								<span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusStyle(p.status)}`}>
									{formatStatus(p.status)}
								</span>
							</div>
							<p className="text-xs text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</p>
							{p.media?.length ? (
								<div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
									{p.media.map(m => (
										<ViewMediaLink key={m.id} fileKey={m.fileKey} label="Receipt" />
									))}
								</div>
							) : null}
						</div>
					)) : (
						<div className="glass-card p-8 text-center">
							<div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
								<CreditCard className="h-6 w-6 text-slate-400" />
							</div>
							<p className="text-sm text-slate-500">No payments yet.</p>
						</div>
					)}
				</div>
			</TabsContent>
		</Tabs>
	);
}

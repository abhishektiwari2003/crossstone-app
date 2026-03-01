"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddProjectUpdate from "@/components/AddProjectUpdate";
import AddPayment from "@/components/AddPayment";
import ViewMediaLink from "@/components/ViewMediaLink";
import ProjectEngineerList from "@/components/ProjectEngineerList";
import ProjectEngineerSelector from "@/components/ProjectEngineerSelector";
import Link from "next/link";
import ProjectDrawingsTab from "@/components/drawings/ProjectDrawingsTab";
import ProjectServicesMenu from "@/components/ProjectServicesMenu";
import ProjectQuarriesTab from "@/components/queries/ProjectQuarriesTab";
import ProjectContactsTab from "@/components/projects/ProjectContactsTab";
import ProjectActivityTab from "@/components/audit/ProjectActivityTab";
import ProjectPaymentsTab from "@/components/payments/ProjectPaymentsTab";
import ProjectMaterialsTab from "@/components/materials/ProjectMaterialsTab";
import type { UserRole } from "@/types/drawings";
import { User, CreditCard, FileText, Clock, HardHat, ClipboardCheck, ArrowRight, PackageOpen } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

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
	canManageMembers: boolean;
	userRole: UserRole;
	existingMemberUserIds?: string[];
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
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const activeTab = searchParams.get("tab") || "overview";

	const handleTabChange = (value: string) => {
		const params = new URLSearchParams(searchParams.toString());
		params.set("tab", value);
		router.replace(`${pathname}?${params.toString()}`, { scroll: false });
	};

	return (
		<Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
			<TabsList className="bg-muted/60 p-1.5 rounded-xl h-auto gap-1 flex justify-start w-full overflow-x-auto whitespace-nowrap scrollbar-hide sm:inline-flex sm:w-auto sm:justify-center">
				<TabsTrigger value="overview" className="flex-1 sm:flex-none rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2.5 min-h-[44px] text-sm font-medium">Overview</TabsTrigger>
				<TabsTrigger value="updates" className="flex-1 sm:flex-none rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2.5 min-h-[44px] text-sm font-medium">Updates</TabsTrigger>
				<TabsTrigger value="payments" className="flex-1 sm:flex-none rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2.5 min-h-[44px] text-sm font-medium">Payments</TabsTrigger>
				<TabsTrigger value="team" className="flex-1 sm:flex-none rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2.5 min-h-[44px] text-sm font-medium">Team</TabsTrigger>
				<TabsTrigger value="inspections" className="flex-1 sm:flex-none rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2.5 min-h-[44px] text-sm font-medium">Inspections</TabsTrigger>
				<TabsTrigger value="materials" className="flex-1 sm:flex-none rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2.5 min-h-[44px] text-sm font-medium flex gap-1.5 items-center">
					<PackageOpen className="h-4 w-4" />
					Materials
				</TabsTrigger>
				<TabsTrigger value="drawings" className="flex-1 sm:flex-none rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2.5 min-h-[44px] text-sm font-medium">Design & Documents</TabsTrigger>
				<TabsTrigger value="quarries" className="flex-1 sm:flex-none rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2.5 min-h-[44px] text-sm font-medium">Quarries & Issues</TabsTrigger>
				<TabsTrigger value="contacts" className="flex-1 sm:flex-none rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2.5 min-h-[44px] text-sm font-medium">Contacts</TabsTrigger>
				{(props.userRole === "ADMIN" || props.userRole === "PROJECT_MANAGER") && (
					<TabsTrigger value="activity" className="flex-1 sm:flex-none rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2.5 min-h-[44px] text-sm font-medium border border-indigo-100 text-indigo-700 data-[state=active]:border-indigo-200">Activity</TabsTrigger>
				)}
			</TabsList>

			{/* ─── Overview Tab ─── */}
			<TabsContent value="overview" className="mt-6">
				<ProjectServicesMenu projectId={props.projectId} userRole={props.userRole} />

				<div className="space-y-4">
					<h2 className="text-lg font-bold text-foreground px-1 flex items-center gap-2">Project Details</h2>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<div className="glass-card p-5">
							<div className="flex items-center gap-2 mb-3">
								<div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
									<User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
								</div>
								<span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Manager</span>
							</div>
							<div className="font-semibold text-foreground">{props.manager?.name ?? "—"}</div>
						</div>
						<div className="glass-card p-5">
							<div className="flex items-center gap-2 mb-3">
								<div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
									<User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
								</div>
								<span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Client</span>
							</div>
							<div className="font-semibold text-foreground">{props.client?.name ?? "—"}</div>
						</div>
						<div className="glass-card p-5">
							<div className="flex items-center gap-2 mb-3">
								<div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
									<Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
								</div>
								<span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Created</span>
							</div>
							<div className="font-semibold text-foreground">{new Date(props.createdAt).toLocaleDateString()}</div>
						</div>
					</div>
					{props.description && (
						<div className="glass-card p-5">
							<h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">{props.description}</p>
						</div>
					)}
				</div>
			</TabsContent>

			{/* ─── Activity Tab (Admin & PM only) ─── */}
			{(props.userRole === "ADMIN" || props.userRole === "PROJECT_MANAGER") && (
				<TabsContent value="activity" className="space-y-4 mt-6">
					<ProjectActivityTab projectId={props.projectId} />
				</TabsContent>
			)}

			{/* ─── Updates Tab ─── */}
			<TabsContent value="updates" className="space-y-4 mt-6">
				<div className="flex items-center justify-between">
					<h2 className="text-lg font-semibold text-foreground">Site Updates</h2>
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
									<span className="text-sm font-semibold text-foreground">{u.author?.name ?? "Unknown"}</span>
									<span className="text-xs text-muted-foreground ml-2">{new Date(u.createdAt).toLocaleDateString()}</span>
								</div>
							</div>
							<p className="text-sm text-muted-foreground leading-relaxed">{u.notes}</p>
							{u.media?.length ? (
								<div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
									{u.media.map(m => (
										<ViewMediaLink key={m.id} fileKey={m.fileKey} />
									))}
								</div>
							) : null}
						</div>
					)) : (
						<div className="glass-card p-8 text-center">
							<div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3 shadow-inner">
								<FileText className="h-6 w-6 text-muted-foreground" />
							</div>
							<p className="text-sm text-muted-foreground">No updates yet.</p>
						</div>
					)}
				</div>
			</TabsContent>

			{/* ─── Payments Tab ─── */}
			<TabsContent value="payments" className="mt-6">
				<ProjectPaymentsTab projectId={props.projectId} userRole={props.userRole} />
			</TabsContent>

			{/* ─── Team Tab ─── */}
			<TabsContent value="team" className="space-y-4 mt-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<HardHat className="h-5 w-5 text-amber-600" />
						<h2 className="text-lg font-semibold text-foreground">Assigned Engineers</h2>
					</div>
					{props.canManageMembers && (
						<ProjectEngineerSelector
							projectId={props.projectId}
							existingMemberUserIds={props.existingMemberUserIds}
						/>
					)}
				</div>
				<ProjectEngineerList
					projectId={props.projectId}
					canManageMembers={props.canManageMembers}
				/>
			</TabsContent>

			{/* ─── Inspections Tab ─── */}
			<TabsContent value="inspections" className="space-y-4 mt-6">
				<Link
					href={`/projects/${props.projectId}/inspections`}
					className="glass-card p-6 sm:p-8 hover-lift group flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left"
				>
					<div className="w-14 h-14 rounded-2xl gradient-orange flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
						<ClipboardCheck className="h-7 w-7 text-white" />
					</div>
					<div className="flex-1">
						<h3 className="text-base font-semibold text-foreground">Site Inspections</h3>
						<p className="text-sm text-muted-foreground mt-0.5">Manage milestones, checklists, and inspection reports</p>
					</div>
					<div className="flex items-center gap-1 text-sm font-semibold text-orange-600 group-hover:text-orange-700 transition-colors shrink-0">
						Open
						<ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
					</div>
				</Link>
			</TabsContent>

			{/* ─── Quarries & Issues Tab ─── */}
			<TabsContent value="quarries" className="mt-6">
				<ProjectQuarriesTab projectId={props.projectId} userRole={props.userRole} />
			</TabsContent>

			{/* ─── Materials Tab ─── */}
			<TabsContent value="materials" className="mt-6">
				<ProjectMaterialsTab projectId={props.projectId} userRole={props.userRole} />
			</TabsContent>

			{/* ─── Design & Documents Tab ─── */}
			<TabsContent value="drawings" className="mt-6">
				<ProjectDrawingsTab projectId={props.projectId} userRole={props.userRole} />
			</TabsContent>

			{/* ─── Contacts Tab ─── */}
			<TabsContent value="contacts" className="mt-6">
				<ProjectContactsTab projectId={props.projectId} />
			</TabsContent>
		</Tabs>
	);
}

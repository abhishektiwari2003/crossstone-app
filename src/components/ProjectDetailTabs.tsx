"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import AddProjectUpdate from "@/components/AddProjectUpdate";
import AddPayment from "@/components/AddPayment";
import ViewMediaLink from "@/components/ViewMediaLink";

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

export default function ProjectDetailTabs(props: Props) {
	return (
		<Tabs defaultValue="overview" className="w-full">
			<TabsList className="grid grid-cols-3 w-full max-w-md">
				<TabsTrigger value="overview">Overview</TabsTrigger>
				<TabsTrigger value="updates">Updates</TabsTrigger>
				<TabsTrigger value="payments">Payments</TabsTrigger>
			</TabsList>
			<Separator className="my-3" />
			<TabsContent value="overview" className="space-y-4">
				<div className="rounded-lg border p-4">
					<h2 className="font-medium mb-2">Overview</h2>
					<p className="text-sm">{props.description || "No description"}</p>
					<div className="mt-3 grid sm:grid-cols-3 gap-3 text-sm">
						<div className="rounded-md border p-3">
							<div className="text-zinc-500">Manager</div>
							<div className="font-medium">{props.manager?.name}</div>
						</div>
						<div className="rounded-md border p-3">
							<div className="text-zinc-500">Client</div>
							<div className="font-medium">{props.client?.name}</div>
						</div>
						<div className="rounded-md border p-3">
							<div className="text-zinc-500">Created</div>
							<div className="font-medium">{new Date(props.createdAt).toLocaleString()}</div>
						</div>
					</div>
				</div>
			</TabsContent>
			<TabsContent value="updates" className="space-y-4">
				<div className="rounded-lg border p-4">
					<div className="flex items-center justify-between mb-2">
						<h2 className="font-medium">Updates</h2>
						{props.canEditUpdates ? <AddProjectUpdate projectId={props.projectId} /> : null}
					</div>
					<div className="space-y-3">
						{props.updates.length ? props.updates.map(u => (
							<div key={u.id} className="rounded-md border p-3">
								<div className="text-sm text-zinc-600">{new Date(u.createdAt).toLocaleString()} by {u.author?.name ?? ""}</div>
								<div className="mt-1">{u.notes}</div>
								{u.media?.length ? (
									<div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
										{u.media.map(m => (
											<ViewMediaLink key={m.id} fileKey={m.fileKey} />
										))}
									</div>
								) : null}
							</div>
						)) : <p className="text-sm text-zinc-600">No updates yet.</p>}
					</div>
				</div>
			</TabsContent>
			<TabsContent value="payments" className="space-y-4">
				<div className="rounded-lg border p-4">
					<div className="flex items-center justify-between mb-2">
						<h2 className="font-medium">Payments</h2>
						{props.canEditPayments ? <AddPayment projectId={props.projectId} /> : null}
					</div>
					<div className="space-y-3">
						{props.payments.length ? props.payments.map(p => (
							<div key={p.id} className="rounded-md border p-3">
								<div className="flex items-center justify-between">
									<div className="font-medium">{p.amount} {p.currency}</div>
									<div className="text-sm text-zinc-600">{p.status}</div>
								</div>
								<div className="text-xs text-zinc-500">{new Date(p.createdAt).toLocaleString()}</div>
								{p.media?.length ? (
									<div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
										{p.media.map(m => (
											<ViewMediaLink key={m.id} fileKey={m.fileKey} label="Receipt" />
										))}
									</div>
								) : null}
							</div>
						)) : <p className="text-sm text-zinc-600">No payments yet.</p>}
					</div>
				</div>
			</TabsContent>
		</Tabs>
	);
}

import { cookies } from "next/headers";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Role } from "@/generated/prisma";

type PaymentListItem = { id: string; amount: string; currency: string; status: string; project?: { id: string; name: string; client?: { id: string; name: string; email: string } } };

async function getPayments(cookie: string): Promise<{ payments: PaymentListItem[] }> {
	const res = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/payments`, { headers: { cookie }, cache: "no-store" });
	return res.json();
}

export default async function PaymentsPage() {
	const cookieStore = await cookies();
	const cookie = cookieStore.toString();
	const session = await getServerSession(authOptions);
	const role = (session?.user as { role?: Role } | null)?.role;
	const { payments } = await getPayments(cookie);

	const showMaster = role === "SUPER_ADMIN" || role === "ADMIN" || role === "PROJECT_MANAGER";

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold">Payments</h1>
			<div className="w-full overflow-x-auto sm:overflow-x-hidden">
				<Table className="min-w-[560px] sm:min-w-0">
					{showMaster ? <TableCaption>All payments across projects</TableCaption> : <TableCaption>Your project payments</TableCaption>}
					<TableHeader>
						<TableRow>
							<TableHead>Amount</TableHead>
							<TableHead>Status</TableHead>
							{showMaster ? <TableHead>Project</TableHead> : null}
							{showMaster ? <TableHead>Client</TableHead> : null}
							<TableHead className="text-right">Currency</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{payments?.length ? payments.map((p) => (
							<TableRow key={p.id}>
								<TableCell className="font-medium">{p.amount}</TableCell>
								<TableCell><Badge variant="secondary">{p.status}</Badge></TableCell>
								{showMaster ? <TableCell className="max-w-[200px] truncate">{p.project?.name}</TableCell> : null}
								{showMaster ? <TableCell className="max-w-[200px] truncate">{p.project?.client?.name}</TableCell> : null}
								<TableCell className="text-right">{p.currency}</TableCell>
							</TableRow>
						)) : (
							<TableRow><TableCell colSpan={showMaster ? 5 : 3} className="text-zinc-600">No payments yet.</TableCell></TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}

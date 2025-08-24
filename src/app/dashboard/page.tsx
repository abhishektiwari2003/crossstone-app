import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Role } from "@/generated/prisma";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";

export default async function DashboardPage() {
	const session = await getServerSession(authOptions);
	const role = (session?.user as { role?: Role } | null)?.role;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">Dashboard</h1>
				<SignOutButton />
			</div>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card className="p-4">
					<div className="text-sm text-zinc-600">Role</div>
					<div className="text-xl font-semibold">{role}</div>
				</Card>
				<Card className="p-4">
					<div className="text-sm text-zinc-600">Projects</div>
					<Link className="underline" href="/projects">Go to projects</Link>
				</Card>
				<Card className="p-4">
					<div className="text-sm text-zinc-600">Payments</div>
					<Link className="underline" href="/payments">Go to payments</Link>
				</Card>
			</div>
		</div>
	);
}

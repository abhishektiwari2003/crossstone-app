import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/authz";
import type { Role } from "@/generated/prisma";
import { cookies } from "next/headers";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

type UserSummary = { id: string; name: string; email: string; role: Role };

async function getUsers(cookie: string): Promise<{ users: UserSummary[] }> {
	const res = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/users`, { headers: { cookie }, cache: "no-store" });
	return res.json();
}

export default async function UsersPage() {
	const session = await getServerSession(authOptions);
	if (!isAdmin((session?.user as { role?: Role } | null)?.role)) return <div className="p-6">Forbidden</div>;
	const cookieStore = await cookies();
	const cookie = cookieStore.toString();
	const { users } = await getUsers(cookie);
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">Users</h1>
				<Link href="/users/new" className="rounded-md bg-violet-600 text-white px-3 py-2">New</Link>
			</div>
			<div className="grid gap-4">
				{users?.length ? users.map((u) => (
					<Card key={u.id} className="p-4 flex items-center justify-between">
						<div className="flex items-center gap-4 min-w-0">
							<Avatar className="h-10 w-10"><AvatarFallback>{u.name?.slice(0,1) || "U"}</AvatarFallback></Avatar>
							<div className="min-w-0">
								<div className="font-medium truncate">{u.name}</div>
								<div className="text-sm text-zinc-600 truncate">{u.email}</div>
							</div>
						</div>
						<Badge variant="secondary" className="shrink-0">{u.role}</Badge>
					</Card>
				)) : <p className="text-sm text-zinc-600">No users yet.</p>}
			</div>
		</div>
	);
}

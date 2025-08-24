import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/authz";

async function getUsers(cookie: string) {
	const res = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/users`, { headers: { cookie }, cache: "no-store" });
	return res.json();
}

export default async function UsersPage() {
	const session = await auth();
	if (!isAdmin((session?.user as any)?.role)) return <div className="p-6">Forbidden</div>;
	const cookie = (await import("next/headers")).cookies().toString();
	const { users } = await getUsers(cookie);
	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">Users</h1>
				<a href="/users/new" className="rounded-md bg-violet-600 text-white px-3 py-2">New</a>
			</div>
			<div className="grid gap-2">
				{users?.length ? users.map((u: any) => (
					<div key={u.id} className="flex items-center justify-between rounded-lg border p-3">
						<div>
							<div className="font-medium">{u.name}</div>
							<div className="text-sm text-zinc-600">{u.email}</div>
						</div>
						<div className="text-xs uppercase tracking-wide">{u.role}</div>
					</div>
				)) : <p className="text-sm text-zinc-600">No users yet.</p>}
			</div>
		</div>
	);
}

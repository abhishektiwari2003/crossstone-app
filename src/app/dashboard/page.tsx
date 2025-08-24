import { auth } from "@/lib/auth";

export default async function DashboardPage() {
	const session = await auth();
	const role = (session?.user as any)?.role as string | undefined;

	return (
		<div className="p-6 space-y-4">
			<h1 className="text-2xl font-semibold">Dashboard</h1>
			<p className="text-zinc-600">Welcome{session?.user?.name ? `, ${session.user.name}` : ""}.</p>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="rounded-lg border p-4">
					<h2 className="font-medium mb-2">Quick Stats</h2>
					<p>Role: {role}</p>
				</div>
				<div className="rounded-lg border p-4">
					<h2 className="font-medium mb-2">Shortcuts</h2>
					<ul className="list-disc pl-6 text-sm">
						{role === "SUPER_ADMIN" || role === "ADMIN" ? (
							<li>Manage users, projects, payments</li>
						) : role === "PROJECT_MANAGER" || role === "SITE_ENGINEER" ? (
							<li>Update assigned projects and upload inspection images</li>
						) : (
							<li>View project tracking and payments</li>
						)}
					</ul>
				</div>
			</div>
		</div>
	);
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canManageProjects } from "@/lib/authz";
import { cookies } from "next/headers";
import { Card } from "@/components/ui/card";
import Link from "next/link";

type ProjectListItem = { id: string; name: string; status: string };

async function getProjects(cookie: string): Promise<{ projects: ProjectListItem[] }> {
	const res = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/projects`, { headers: { cookie } , cache: "no-store"});
	return res.json();
}

export default async function ProjectsPage() {
	const session = await getServerSession(authOptions);
	const cookieStore = await cookies();
	const cookie = cookieStore.toString();
	const { projects } = await getProjects(cookie);
	const isAdmin = canManageProjects((session?.user as { role?: "SUPER_ADMIN" | "ADMIN" | "PROJECT_MANAGER" | "SITE_ENGINEER" | "CLIENT" } | null)?.role);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">Projects</h1>
				{isAdmin ? <Link href="/projects/new" className="rounded-md bg-violet-600 text-white px-3 py-2">New</Link> : null}
			</div>
			<div className="grid gap-3">
				{projects?.length ? projects.map((p) => (
					<Link key={p.id} href={`/projects/${p.id}`}>
						<Card className="p-4 hover:bg-zinc-50">
							<div className="font-medium">{p.name}</div>
							<div className="text-sm text-zinc-600">{p.status}</div>
						</Card>
					</Link>
				)) : <p className="text-sm text-zinc-600">No projects yet.</p>}
			</div>
		</div>
	);
}

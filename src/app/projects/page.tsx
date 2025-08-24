import { auth } from "@/lib/auth";
import { canManageProjects } from "@/lib/authz";

async function getProjects(cookie: string) {
	const res = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/projects`, { headers: { cookie } , cache: "no-store"});
	return res.json();
}

export default async function ProjectsPage() {
	const session = await auth();
	const cookie = (await import("next/headers")).cookies().toString();
	const { projects } = await getProjects(cookie);
	const isAdmin = canManageProjects((session?.user as any)?.role);

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">Projects</h1>
				{isAdmin ? <a href="/projects/new" className="rounded-md bg-violet-600 text-white px-3 py-2">New</a> : null}
			</div>
			<div className="grid gap-4">
				{projects?.length ? projects.map((p: any) => (
					<a key={p.id} href={`/projects/${p.id}`} className="rounded-lg border p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900">
						<div className="font-medium">{p.name}</div>
						<div className="text-sm text-zinc-600">{p.status}</div>
					</a>
				)) : <p className="text-sm text-zinc-600">No projects yet.</p>}
			</div>
		</div>
	);
}

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AddProjectUpdate from "@/components/AddProjectUpdate";
import AddPayment from "@/components/AddPayment";
import type { Role } from "@/generated/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ViewMediaLink from "@/components/ViewMediaLink";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as { role?: Role } | null)?.role;
  const id = params.id;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      manager: { select: { id: true, name: true, email: true } },
      client: { select: { id: true, name: true, email: true } },
      updates: { orderBy: { createdAt: "desc" }, include: { media: true, author: { select: { name: true } } } },
      payments: { orderBy: { createdAt: "desc" }, include: { media: true } },
    },
  });
  if (!project) return notFound();

  const canEditUpdates = userRole === "SUPER_ADMIN" || userRole === "ADMIN" || userRole === "PROJECT_MANAGER" || userRole === "SITE_ENGINEER";
  const canEditPayments = userRole === "SUPER_ADMIN" || userRole === "ADMIN" || userRole === "PROJECT_MANAGER";

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">{project.name}</h1>
        <p className="text-sm text-zinc-600">Status: {project.status}</p>
      </div>

      <div className="flex gap-2 text-sm">
        <a href="#overview" className="px-3 py-1 rounded-md border">Overview</a>
        <a href="#updates" className="px-3 py-1 rounded-md border">Updates</a>
        <a href="#payments" className="px-3 py-1 rounded-md border">Payments</a>
      </div>

      <section id="overview" className="space-y-4">
        <div className="rounded-lg border p-4">
          <h2 className="font-medium mb-2">Overview</h2>
          <p className="text-sm">{project.description || "No description"}</p>
          <div className="mt-3 grid sm:grid-cols-3 gap-3 text-sm">
            <div className="rounded-md border p-3">
              <div className="text-zinc-500">Manager</div>
              <div className="font-medium">{project.manager?.name}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-zinc-500">Client</div>
              <div className="font-medium">{project.client?.name}</div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-zinc-500">Created</div>
              <div className="font-medium">{new Date(project.createdAt).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </section>

      <section id="updates" className="space-y-4">
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-medium">Updates</h2>
            {canEditUpdates ? <AddProjectUpdate projectId={project.id} /> : null}
          </div>
          <div className="space-y-3">
            {project.updates.length ? project.updates.map(u => (
              <div key={u.id} className="rounded-md border p-3">
                <div className="text-sm text-zinc-600">{new Date(u.createdAt).toLocaleString()} by {u.author?.name ?? ""}</div>
                <div className="mt-1">{u.notes}</div>
                {u.media?.length ? (
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {u.media.map(m => (
                      <ViewMediaLink key={m.id} fileKey={m.fileKey} thumbnailUrl={m.fileUrl} />
                    ))}
                  </div>
                ) : null}
              </div>
            )) : <p className="text-sm text-zinc-600">No updates yet.</p>}
          </div>
        </div>
      </section>

      <section id="payments" className="space-y-4">
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-medium">Payments</h2>
            {canEditPayments ? <AddPayment projectId={project.id} /> : null}
          </div>
          <div className="space-y-3">
            {project.payments.length ? project.payments.map(p => (
              <div key={p.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{p.amount.toString()} {p.currency}</div>
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
      </section>
    </div>
  );
}



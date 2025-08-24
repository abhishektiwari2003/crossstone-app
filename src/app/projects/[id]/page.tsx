import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Role } from "@/generated/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ProjectDetailTabs from "@/components/ProjectDetailTabs";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as { role?: Role } | null)?.role;
  const { id } = await params;
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
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">{project.name}</h1>
        <p className="text-sm text-zinc-600">Status: {project.status}</p>
      </div>

      <ProjectDetailTabs
        projectId={project.id}
        name={project.name}
        description={project.description}
        status={project.status}
        createdAt={project.createdAt.toISOString()}
        manager={project.manager}
        client={project.client}
        updates={project.updates.map(u => ({ id: u.id, createdAt: u.createdAt.toISOString(), notes: u.notes, author: u.author, media: u.media.map(m => ({ id: m.id, fileKey: m.fileKey })) }))}
        payments={project.payments.map(p => ({ id: p.id, amount: p.amount.toString(), currency: p.currency, status: p.status, createdAt: p.createdAt.toISOString(), media: p.media.map(m => ({ id: m.id, fileKey: m.fileKey })) }))}
        canEditUpdates={canEditUpdates}
        canEditPayments={canEditPayments}
      />
    </div>
  );
}



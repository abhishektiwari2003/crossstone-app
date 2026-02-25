import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Role } from "@/generated/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/authz";
import ProjectDetailTabs from "@/components/ProjectDetailTabs";
import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";

function getStatusStyle(status: string) {
  switch (status) {
    case "PLANNED": return "status-planned";
    case "IN_PROGRESS": return "status-in-progress";
    case "ON_HOLD": return "status-on-hold";
    case "COMPLETED": return "status-completed";
    default: return "status-pending";
  }
}

function formatStatus(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

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
      members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
    },
  });
  if (!project) return notFound();

  const canEditUpdates = userRole === "SUPER_ADMIN" || userRole === "ADMIN" || userRole === "PROJECT_MANAGER" || userRole === "SITE_ENGINEER";
  const canEditPayments = userRole === "SUPER_ADMIN" || userRole === "ADMIN" || userRole === "PROJECT_MANAGER";
  const canManageMembers = isAdmin(userRole as import("@/lib/authz").AppRole);
  const existingMemberUserIds = project.members?.map(m => m.user.id) ?? [];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </Link>

      {/* Hero Header */}
      <div className="rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-8 relative">
          {/* Decorative blurs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-purple-500/8 rounded-full blur-[60px]" />

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{project.name}</h1>
                {project.description && (
                  <p className="text-slate-400 mt-1 max-w-lg">{project.description}</p>
                )}
              </div>
              <span className={`inline-flex items-center self-start px-3.5 py-1.5 rounded-full text-xs font-bold ${getStatusStyle(project.status)}`}>
                {formatStatus(project.status)}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-5 text-sm text-slate-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Created {project.createdAt.toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
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
        canManageMembers={canManageMembers}
        existingMemberUserIds={existingMemberUserIds}
      />
    </div>
  );
}

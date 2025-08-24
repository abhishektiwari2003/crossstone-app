import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canCreateProjectUpdate } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { Role } from "@/generated/prisma";

const CreateSchema = z.object({
	projectId: z.string().min(1),
	notes: z.string().min(1),
	statusSnapshot: z.string().optional(),
});

export async function POST(req: Request) {
	const session = await getServerSession(authOptions);
	const user = (session?.user as { id: string; role?: Role } | null) ?? null;
	if (!canCreateProjectUpdate(user?.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	const body = await req.json().catch(() => null);
	const parsed = CreateSchema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
	const { projectId, notes, statusSnapshot } = parsed.data;
	const project = await prisma.project.findUnique({ where: { id: projectId } });
	if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
	const update = await prisma.projectUpdate.create({ data: { projectId, authorId: user!.id, notes, statusSnapshot } });
	return NextResponse.json({ update });
}

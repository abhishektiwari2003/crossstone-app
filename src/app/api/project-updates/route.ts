import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canCreateProjectUpdate } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateSchema = z.object({
	projectId: z.string().min(1),
	notes: z.string().min(1),
	statusSnapshot: z.string().optional(),
});

export async function POST(req: Request) {
	const session = await auth();
	const role = (session?.user as any)?.role as string | undefined;
	if (!canCreateProjectUpdate(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	const body = await req.json().catch(() => null);
	const parsed = CreateSchema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
	const { projectId, notes, statusSnapshot } = parsed.data;
	const project = await prisma.project.findUnique({ where: { id: projectId } });
	if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
	const update = await prisma.projectUpdate.create({ data: { projectId, authorId: (session?.user as any)?.id, notes, statusSnapshot } });
	return NextResponse.json({ update });
}

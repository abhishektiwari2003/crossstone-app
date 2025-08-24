import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canManageProjects } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateSchema = z.object({
	name: z.string().min(1).optional(),
	description: z.string().optional(),
	status: z.enum(["PLANNED", "IN_PROGRESS", "ON_HOLD", "COMPLETED"]).optional(),
	managerId: z.string().optional(),
	clientId: z.string().optional(),
});

export async function GET(_: Request, { params }: { params: { id: string } }) {
	const session = await auth();
	if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const project = await prisma.project.findUnique({ where: { id: params.id } });
	if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
	return NextResponse.json({ project });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
	const session = await auth();
	if (!canManageProjects((session?.user as any)?.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	const body = await req.json().catch(() => null);
	const parsed = UpdateSchema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
	const project = await prisma.project.update({ where: { id: params.id }, data: parsed.data });
	return NextResponse.json({ project });
}

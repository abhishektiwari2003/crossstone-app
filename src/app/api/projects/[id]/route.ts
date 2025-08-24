import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canManageProjects } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { Role } from "@/generated/prisma";

const UpdateSchema = z.object({
	name: z.string().min(1).optional(),
	description: z.string().optional(),
	status: z.enum(["PLANNED", "IN_PROGRESS", "ON_HOLD", "COMPLETED"]).optional(),
	managerId: z.string().optional(),
	clientId: z.string().optional(),
});

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
	const session = await getServerSession(authOptions);
	if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const { id } = await context.params;
	const project = await prisma.project.findUnique({ where: { id } });
	if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
	return NextResponse.json({ project });
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const session = await getServerSession(authOptions);
	const role = (session?.user as { role?: Role } | null)?.role;
	if (!canManageProjects(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	const body = await req.json().catch(() => null);
	const parsed = UpdateSchema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
	const { id } = await context.params;
	const project = await prisma.project.update({ where: { id }, data: parsed.data });
	return NextResponse.json({ project });
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canManageProjects } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateProjectSchema = z.object({
	name: z.string().min(1),
	description: z.string().optional(),
	managerId: z.string().min(1),
	clientId: z.string().min(1),
});

export async function GET() {
	const session = await auth();
	if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const role = (session.user as any).role as string;
	const userId = (session.user as any).id as string;

	if (canManageProjects(role)) {
		const projects = await prisma.project.findMany({});
		return NextResponse.json({ projects });
	}

	if (role === "PROJECT_MANAGER" || role === "SITE_ENGINEER") {
		const projects = await prisma.project.findMany({ where: { OR: [{ managerId: userId }, { members: { some: { userId } } }] } });
		return NextResponse.json({ projects });
	}

	// Client
	const projects = await prisma.project.findMany({ where: { clientId: userId } });
	return NextResponse.json({ projects });
}

export async function POST(req: Request) {
	const session = await auth();
	if (!canManageProjects((session?.user as any)?.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	const body = await req.json().catch(() => null);
	const parsed = CreateProjectSchema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
	const { name, description, managerId, clientId } = parsed.data;
	const project = await prisma.project.create({ data: { name, description, managerId, clientId, createdById: (session?.user as any)?.id } });
	return NextResponse.json({ project });
}

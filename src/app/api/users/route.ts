import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcrypt";

const CreateUserSchema = z.object({
	name: z.string().min(1),
	email: z.string().email(),
	role: z.enum(["SUPER_ADMIN", "ADMIN", "PROJECT_MANAGER", "SITE_ENGINEER", "CLIENT"]),
	password: z.string().min(6),
});

export async function GET() {
	const session = await auth();
	if (!isAdmin((session?.user as any)?.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true } });
	return NextResponse.json({ users });
}

export async function POST(req: Request) {
	const session = await auth();
	if (!isAdmin((session?.user as any)?.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	const body = await req.json().catch(() => null);
	const parsed = CreateUserSchema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
	const { name, email, role, password } = parsed.data;
	const hash = await bcrypt.hash(password, 10);
	const user = await prisma.user.create({
		data: { name, email, role: role as any, passwordHash: hash, createdById: (session?.user as any)?.id },
		select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
	});
	return NextResponse.json({ user });
}

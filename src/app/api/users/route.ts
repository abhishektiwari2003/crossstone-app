import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcrypt";
import type { Role } from "@/generated/prisma";

const CreateUserSchema = z.object({
	name: z.string().min(1),
	email: z.string().email(),
	role: z.enum(["SUPER_ADMIN", "ADMIN", "PROJECT_MANAGER", "SITE_ENGINEER", "CLIENT"]),
	password: z.string().min(6),
});

type UserSummary = { id: string; name: string; email: string; role: Role; isActive: boolean; createdAt: Date };

export async function GET() {
	const session = await getServerSession(authOptions);
	const role = (session?.user as { role?: Role } | null)?.role;
	if (!isAdmin(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	const users: UserSummary[] = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true } });
	return NextResponse.json({ users });
}

export async function POST(req: Request) {
	const session = await getServerSession(authOptions);
	const currentUser = (session?.user as { id: string; role?: Role } | null) ?? null;
	if (!isAdmin(currentUser?.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	const body = await req.json().catch(() => null);
	const parsed = CreateUserSchema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
	const { name, email, role, password } = parsed.data;
	const hash = await bcrypt.hash(password, 10);
	const user: UserSummary = await prisma.user.create({
		data: { name, email, role: role as Role, passwordHash: hash, createdById: currentUser!.id },
		select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
	});
	return NextResponse.json({ user });
}

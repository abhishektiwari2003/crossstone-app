import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { Role } from "@/generated/prisma";

const UpdateSchema = z.object({
	name: z.string().min(1).optional(),
	role: z.enum(["SUPER_ADMIN", "ADMIN", "PROJECT_MANAGER", "SITE_ENGINEER", "CLIENT"]).optional(),
	isActive: z.boolean().optional(),
	password: z.string().min(6).optional(),
});

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const session = await getServerSession(authOptions);
	const role = (session?.user as { role?: Role } | null)?.role;
	if (!isAdmin(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	const body = await req.json().catch(() => null);
	const parsed = UpdateSchema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
	const data: Record<string, unknown> = { ...parsed.data };
	if (typeof (data as { password?: string }).password === "string") {
		const bcrypt = await import("bcrypt");
		data.passwordHash = await bcrypt.hash((data as { password: string }).password, 10);
		delete (data as { password?: string }).password;
	}
	const { id } = await context.params;
	const user = await prisma.user.update({ where: { id }, data, select: { id: true, name: true, email: true, role: true, isActive: true } });
	return NextResponse.json({ user });
}

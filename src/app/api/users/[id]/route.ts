import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateSchema = z.object({
	name: z.string().min(1).optional(),
	role: z.enum(["SUPER_ADMIN", "ADMIN", "PROJECT_MANAGER", "SITE_ENGINEER", "CLIENT"]).optional(),
	isActive: z.boolean().optional(),
	password: z.string().min(6).optional(),
});

export async function PATCH(_: Request, { params }: { params: { id: string } }) {
	const session = await auth();
	if (!isAdmin((session?.user as any)?.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	const body = await _.json().catch(() => null);
	const parsed = UpdateSchema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
	const data: any = { ...parsed.data };
	if (data.password) {
		const bcrypt = await import("bcrypt");
		data.passwordHash = await bcrypt.hash(data.password, 10);
		delete data.password;
	}
	const user = await prisma.user.update({ where: { id: params.id }, data, select: { id: true, name: true, email: true, role: true, isActive: true } });
	return NextResponse.json({ user });
}

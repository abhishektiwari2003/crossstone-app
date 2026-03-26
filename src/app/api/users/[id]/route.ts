import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma_new";
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
	if (!isSuperAdmin(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	const body = await req.json().catch(() => null);
	const parsed = UpdateSchema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

	const { name, role: nextRole, isActive, password } = parsed.data;
	const data: Prisma.UserUpdateInput = {};
	if (name !== undefined) data.name = name;
	if (nextRole !== undefined) data.role = nextRole;
	if (isActive !== undefined) data.isActive = isActive;
	if (password !== undefined) {
		const bcrypt = await import("bcrypt");
		data.passwordHash = await bcrypt.hash(password, 10);
	}

	const { id } = await context.params;
	const user = await prisma.user.update({ where: { id }, data, select: { id: true, name: true, email: true, role: true, isActive: true } });
	return NextResponse.json({ user });
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
	const session = await getServerSession(authOptions);
	const role = (session?.user as { role?: Role } | null)?.role;
	const sessionUserId = (session?.user as { id?: string } | null)?.id;
	if (!isSuperAdmin(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	if (!sessionUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { id } = await context.params;
	if (id === sessionUserId) {
		return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
	}

	const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
	if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

	if (target.role === "SUPER_ADMIN") {
		const superAdminCount = await prisma.user.count({ where: { role: "SUPER_ADMIN" } });
		if (superAdminCount <= 1) {
			return NextResponse.json({ error: "Cannot delete the last super admin." }, { status: 400 });
		}
	}

	try {
		await prisma.user.delete({ where: { id } });
	} catch (e) {
		if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
			return NextResponse.json(
				{ error: "This user is still linked to projects or other records and cannot be deleted." },
				{ status: 409 }
			);
		}
		throw e;
	}

	return NextResponse.json({ ok: true });
}

import { NextResponse, type NextRequest } from "next/server";
import { canManageProjects, canViewProject, type AppRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getCurrentUser, AuthError } from "@/lib/session";
import { sanitizeInput } from "@/lib/sanitize";
import { mutationLimiter, getClientIdentifier } from "@/lib/rateLimit";

const UpdateSchema = z.object({
	name: z.string().min(1).optional(),
	description: z.string().optional(),
	status: z.enum(["PLANNED", "IN_PROGRESS", "ON_HOLD", "COMPLETED"]).optional(),
	managerId: z.string().optional(),
	clientId: z.string().optional(),
	totalValue: z.number().positive().optional().nullable(),
});

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
	try {
		const currentUser = await getCurrentUser();
		const { id } = await context.params;

		// RBAC: check if user can view this project
		const allowed = await canViewProject(currentUser.id, currentUser.role as AppRole, id);
		if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

		const project = await prisma.project.findUnique({
			where: { id },
			include: {
				members: {
					include: {
						user: {
							select: { id: true, name: true, email: true, role: true },
						},
					},
				},
			},
		});
		if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
		return NextResponse.json({ project });
	} catch (error) {
		if (error instanceof AuthError) {
			return NextResponse.json({ error: error.message }, { status: error.status });
		}
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	try {
		const currentUser = await getCurrentUser();

		if (!canManageProjects(currentUser.role)) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		// Rate limiting
		const rl = mutationLimiter(getClientIdentifier(req, currentUser.id));
		if (!rl.allowed) {
			return NextResponse.json({ error: "Too many requests" }, { status: 429 });
		}

		const body = await req.json().catch(() => null);
		const parsed = UpdateSchema.safeParse(body);
		if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

		const { id } = await context.params;

		// Sanitize string fields
		const data = { ...parsed.data };
		if (data.name) data.name = sanitizeInput(data.name);
		if (data.description) data.description = sanitizeInput(data.description);

		const project = await prisma.project.update({ where: { id }, data });
		return NextResponse.json({ project });
	} catch (error) {
		if (error instanceof AuthError) {
			return NextResponse.json({ error: error.message }, { status: error.status });
		}
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}


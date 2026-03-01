import { NextResponse } from "next/server";
import { canManageProjects } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getProjectsForUser, getPaginatedProjects } from "@/modules/projects/service";
import { getCurrentUser, AuthError } from "@/lib/session";
import { sanitizeInput } from "@/lib/sanitize";
import { mutationLimiter, getClientIdentifier } from "@/lib/rateLimit";

const CreateProjectSchema = z.object({
	name: z.string().min(1),
	description: z.string().optional(),
	managerId: z.string().min(1),
	clientId: z.string().min(1),
	totalValue: z.number().positive().optional(),
});

export async function GET(req: Request) {
	try {
		const currentUser = await getCurrentUser();

		const { searchParams } = new URL(req.url);
		const cursor = searchParams.get("cursor");
		const limitParam = searchParams.get("limit");

		// If pagination params → mobile-optimized response
		if (cursor !== null || limitParam !== null) {
			const limit = limitParam ? parseInt(limitParam, 10) || 10 : 10;
			const result = await getPaginatedProjects(currentUser.id, currentUser.role, cursor, limit);
			return NextResponse.json(result);
		}

		// Default: full response for backward compatibility
		const projects = await getProjectsForUser(currentUser.id, currentUser.role);
		return NextResponse.json({ projects });
	} catch (error) {
		if (error instanceof AuthError) {
			return NextResponse.json({ error: error.message }, { status: error.status });
		}
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}

export async function POST(req: Request) {
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
		const parsed = CreateProjectSchema.safeParse(body);
		if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

		const { name, description, managerId, clientId, totalValue } = parsed.data;
		const project = await prisma.project.create({
			data: {
				name: sanitizeInput(name),
				description: description ? sanitizeInput(description) : undefined,
				managerId,
				clientId,
				totalValue,
				createdById: currentUser.id,
			},
		});
		return NextResponse.json({ project }, { status: 201 });
	} catch (error) {
		if (error instanceof AuthError) {
			return NextResponse.json({ error: error.message }, { status: error.status });
		}
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}


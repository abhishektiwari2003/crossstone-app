import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { PaymentStatus } from "@/generated/prisma";
import { canEditPayments, isAdmin, validateProjectAccess } from "@/lib/authz";
import { getCurrentUser, AuthError } from "@/lib/session";
import { sanitizeInput } from "@/lib/sanitize";
import { mutationLimiter, getClientIdentifier } from "@/lib/rateLimit";
import { AuthorizationError } from "@/lib/authz";

const CreatePaymentSchema = z.object({
	projectId: z.string().min(1),
	amount: z.number().positive(),
	currency: z.string().min(1).default("INR"),
	status: z.enum(["PENDING", "PARTIAL", "PAID", "OVERDUE"]).default("PENDING"),
	dueDate: z.string().datetime().optional(),
	notes: z.string().optional(),
});

const includeProject = {
	project: {
		select: {
			id: true,
			name: true,
			client: { select: { id: true, name: true, email: true } },
		},
	},
} as const;

export async function GET() {
	try {
		const currentUser = await getCurrentUser();

		if (currentUser.role === "CLIENT") {
			const payments = await prisma.payment.findMany({
				where: { project: { clientId: currentUser.id } },
				include: includeProject,
				orderBy: { createdAt: "desc" },
			});
			return NextResponse.json({ payments });
		}

		if (currentUser.role === "PROJECT_MANAGER" || currentUser.role === "SITE_ENGINEER") {
			const payments = await prisma.payment.findMany({
				where: {
					project: {
						OR: [
							{ managerId: currentUser.id },
							{ members: { some: { userId: currentUser.id } } },
						],
					},
				},
				include: includeProject,
				orderBy: { createdAt: "desc" },
			});
			return NextResponse.json({ payments });
		}

		const payments = await prisma.payment.findMany({
			include: includeProject,
			orderBy: { createdAt: "desc" },
		});
		return NextResponse.json({ payments });
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

		if (!canEditPayments(currentUser.role)) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		// Rate limiting
		const rl = mutationLimiter(getClientIdentifier(req, currentUser.id));
		if (!rl.allowed) {
			return NextResponse.json({ error: "Too many requests" }, { status: 429 });
		}

		const body = await req.json().catch(() => null);
		const parsed = CreatePaymentSchema.safeParse(body);
		if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

		const { projectId, amount, currency, status, dueDate, notes } = parsed.data;

		// Validate project access
		await validateProjectAccess(currentUser.id, currentUser.role, projectId);

		const payment = await prisma.payment.create({
			data: {
				projectId,
				createdById: currentUser.id,
				amount,
				currency,
				status: status as PaymentStatus,
				dueDate: dueDate ? new Date(dueDate) : null,
				notes: notes ? sanitizeInput(notes) : null,
			},
		});
		return NextResponse.json({ payment }, { status: 201 });
	} catch (error) {
		if (error instanceof AuthError) {
			return NextResponse.json({ error: error.message }, { status: error.status });
		}
		if (error instanceof AuthorizationError) {
			return NextResponse.json({ error: error.message }, { status: error.status });
		}
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
}


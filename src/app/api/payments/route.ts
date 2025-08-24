import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canEditPayments } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreatePaymentSchema = z.object({
	projectId: z.string().min(1),
	amount: z.number().positive(),
	currency: z.string().min(1).default("INR"),
	status: z.enum(["PENDING", "PARTIAL", "PAID", "OVERDUE"]).default("PENDING"),
	dueDate: z.string().datetime().optional(),
	notes: z.string().optional(),
});

export async function GET() {
	const session = await auth();
	if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const role = (session.user as any).role as string;
	const userId = (session.user as any).id as string;

	if (role === "CLIENT") {
		const payments = await prisma.payment.findMany({ where: { project: { clientId: userId } } });
		return NextResponse.json({ payments });
	}

	if (role === "PROJECT_MANAGER" || role === "SITE_ENGINEER") {
		const payments = await prisma.payment.findMany({ where: { project: { OR: [{ managerId: userId }, { members: { some: { userId } } }] } } });
		return NextResponse.json({ payments });
	}

	const payments = await prisma.payment.findMany({});
	return NextResponse.json({ payments });
}

export async function POST(req: Request) {
	const session = await auth();
	if (!canEditPayments((session?.user as any)?.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	const body = await req.json().catch(() => null);
	const parsed = CreatePaymentSchema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
	const { projectId, amount, currency, status, dueDate, notes } = parsed.data;
	const payment = await prisma.payment.create({
		data: {
			projectId,
			createdById: (session?.user as any)?.id,
			amount,
			currency,
			status: status as any,
			// @ts-expect-error Prisma accepts Date
			dueDate: dueDate ? new Date(dueDate) : null,
			notes,
		},
	});
	return NextResponse.json({ payment });
}

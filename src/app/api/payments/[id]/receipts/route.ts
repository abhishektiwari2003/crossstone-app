import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { canEditPayments } from "@/lib/authz";
import type { Role } from "@/generated/prisma";

const BodySchema = z.object({
	key: z.string().min(1),
	url: z.string().url(),
	mimeType: z.string().min(1),
	fileSize: z.number().int().positive(),
});

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const session = await getServerSession(authOptions);
	const user = (session?.user as { id: string; role?: Role } | null) ?? null;
	if (!canEditPayments(user?.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	const json = await req.json().catch(() => null);
	const parsed = BodySchema.safeParse(json);
	if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
	const { id } = await context.params;
	const payment = await prisma.payment.findUnique({ where: { id } });
	if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });
	const media = await prisma.media.create({
		data: {
			projectId: payment.projectId,
			paymentId: payment.id,
			type: "RECEIPT",
			fileKey: parsed.data.key,
			fileUrl: parsed.data.url,
			mimeType: parsed.data.mimeType,
			fileSize: parsed.data.fileSize,
			createdById: user!.id,
		},
	});
	return NextResponse.json({ media });
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { canEditPayments } from "@/lib/authz";

const BodySchema = z.object({
	key: z.string().min(1),
	url: z.string().url(),
	mimeType: z.string().min(1),
	fileSize: z.number().int().positive(),
});

export async function POST(_: Request, { params }: { params: { id: string } }) {
	const session = await auth();
	if (!canEditPayments((session?.user as any)?.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	const json = await _.json().catch(() => null);
	const parsed = BodySchema.safeParse(json);
	if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
	const payment = await prisma.payment.findUnique({ where: { id: params.id } });
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
			createdById: (session?.user as any)?.id,
		},
	});
	return NextResponse.json({ media });
}

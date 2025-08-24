import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { presignPutObject } from "@/lib/s3";
import type { Role } from "@/generated/prisma";

const BodySchema = z.object({
	type: z.enum(["inspection", "receipt"]),
	projectId: z.string().min(1),
	paymentId: z.string().optional(),
	mimeType: z.string().min(1),
	fileSize: z.number().int().positive(),
});

const IMAGE_MIME = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const RECEIPT_MIME = [...IMAGE_MIME, "application/pdf"];

export async function POST(req: Request) {
	const session = await getServerSession(authOptions);
	if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const role = (session.user as { role?: Role }).role;

	const json = await req.json().catch(() => null);
	const parsed = BodySchema.safeParse(json);
	if (!parsed.success) {
		return NextResponse.json({ error: "Invalid body" }, { status: 400 });
	}
	const { type, projectId, paymentId, mimeType, fileSize } = parsed.data;

	const maxMb = Number(process.env.MAX_UPLOAD_MB || "10");
	const maxBytes = maxMb * 1024 * 1024;
	if (fileSize > maxBytes) return NextResponse.json({ error: "File too large" }, { status: 400 });
	if (type === "inspection" && !IMAGE_MIME.includes(mimeType)) return NextResponse.json({ error: "Invalid mime" }, { status: 400 });
	if (type === "receipt" && !RECEIPT_MIME.includes(mimeType)) return NextResponse.json({ error: "Invalid mime" }, { status: 400 });

	const project = await prisma.project.findUnique({ where: { id: projectId } });
	if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

	if (type === "receipt") {
		if (!paymentId) return NextResponse.json({ error: "paymentId required" }, { status: 400 });
		const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
		if (!payment || payment.projectId !== projectId) return NextResponse.json({ error: "Payment not found" }, { status: 404 });
	}

	// Simple role check: PM/Engineer/Admin/SuperAdmin can upload; clients cannot
	if (role === "CLIENT") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

	const ext = mimeType === "application/pdf" ? "pdf" : mimeType.split("/")[1]?.replace("jpeg", "jpg");
	const id = crypto.randomUUID();
	const key =
		type === "inspection"
			? `projects/${projectId}/inspections/${id}.${ext}`
			: `projects/${projectId}/payments/${paymentId}/receipts/${id}.${ext}`;

	const { url } = await presignPutObject({ key, contentType: mimeType, contentLength: fileSize });
	return NextResponse.json({ url, key });
}

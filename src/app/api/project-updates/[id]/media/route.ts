import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
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
	if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const json = await req.json().catch(() => null);
	const parsed = BodySchema.safeParse(json);
	if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
	const { id } = await context.params;
	const update = await prisma.projectUpdate.findUnique({ where: { id } });
	if (!update) return NextResponse.json({ error: "Update not found" }, { status: 404 });
	const media = await prisma.media.create({
		data: {
			projectId: update.projectId,
			projectUpdateId: update.id,
			type: "INSPECTION_IMAGE",
			fileKey: parsed.data.key,
			fileUrl: parsed.data.url,
			mimeType: parsed.data.mimeType,
			fileSize: parsed.data.fileSize,
			createdById: user.id,
		},
	});
	return NextResponse.json({ media });
}

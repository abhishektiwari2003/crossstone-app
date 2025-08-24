import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const BodySchema = z.object({
	key: z.string().min(1),
	url: z.string().url(),
	mimeType: z.string().min(1),
	fileSize: z.number().int().positive(),
});

export async function POST(_: Request, { params }: { params: { id: string } }) {
	const session = await auth();
	if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const json = await _.json().catch(() => null);
	const parsed = BodySchema.safeParse(json);
	if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
	const update = await prisma.projectUpdate.findUnique({ where: { id: params.id } });
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
			createdById: (session.user as any).id,
		},
	});
	return NextResponse.json({ media });
}

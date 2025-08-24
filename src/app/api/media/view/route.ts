import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { presignGetObject } from "@/lib/s3";

const Query = z.object({ key: z.string().min(1) });

export async function GET(req: Request) {
	const session = await getServerSession(authOptions);
	if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const { searchParams } = new URL(req.url);
	const parsed = Query.safeParse({ key: searchParams.get("key") });
	if (!parsed.success) return NextResponse.json({ error: "Invalid key" }, { status: 400 });
	const { url } = await presignGetObject({ key: parsed.data.key, expiresInSeconds: 60 });
	return NextResponse.json({ url });
}

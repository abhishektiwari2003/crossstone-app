import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createS3Client } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import type { Role } from "@/generated/prisma";

// Force Node.js runtime (not Edge) for Buffer/S3 SDK support
export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const role = (session.user as { role?: Role }).role;

        if (role === "CLIENT") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const projectId = formData.get("projectId") as string | null;
        const uploadType = formData.get("type") as string | null;

        if (!file || !projectId) {
            return NextResponse.json({ error: "file and projectId are required" }, { status: 400 });
        }

        const maxMb = uploadType === "drawing" ? 50 : 10;
        if (file.size > maxMb * 1024 * 1024) {
            return NextResponse.json({ error: `File too large (max ${maxMb}MB)` }, { status: 400 });
        }

        const mimeType = file.type || "application/octet-stream";
        const ext = mimeType === "application/pdf" ? "pdf" : mimeType.split("/")[1]?.replace("jpeg", "jpg") || "bin";
        const id = crypto.randomUUID();

        let key: string;
        if (uploadType === "drawing") {
            key = `projects/${projectId}/drawings/${id}.${ext}`;
        } else if (uploadType === "inspection") {
            key = `projects/${projectId}/inspections/${id}.${ext}`;
        } else {
            key = `projects/${projectId}/uploads/${id}.${ext}`;
        }

        const client = createS3Client();
        const bucket = process.env.S3_BUCKET!;
        const arrayBuffer = await file.arrayBuffer();
        const body = new Uint8Array(arrayBuffer);

        await client.send(new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: body,
            ContentType: mimeType,
        }));

        const region = process.env.S3_REGION || "eu-north-1";
        const fileUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

        return NextResponse.json({ key, url: fileUrl });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("Upload API error:", message, err);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

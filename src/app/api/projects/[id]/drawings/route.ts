import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Role } from "@/generated/prisma";
import type { AppRole } from "@/lib/authz";
import { createDrawing, listProjectDrawings } from "@/modules/drawings/service";
import { z } from "zod";

const CreateDrawingSchema = z.object({
    url: z.string().min(1, "URL is required"),
    version: z.number().int().min(1, "Version must be a positive integer"),
});

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = session.user as { id: string; role?: Role };
    const { id: projectId } = await context.params;

    const result = await listProjectDrawings(projectId, {
        id: currentUser.id,
        role: currentUser.role as AppRole,
    });

    if ("error" in result) {
        return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ drawings: result.drawings });
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = session.user as { id: string; role?: Role };
    const { id: projectId } = await context.params;

    const body = await req.json().catch(() => null);
    const parsed = CreateDrawingSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
    }

    const result = await createDrawing(projectId, parsed.data, {
        id: currentUser.id,
        role: currentUser.role as AppRole,
    });

    if ("error" in result) {
        return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ drawing: result.drawing }, { status: 201 });
}

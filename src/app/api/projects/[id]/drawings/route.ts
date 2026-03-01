import { NextResponse, type NextRequest } from "next/server";
import { createDrawing, listProjectDrawings, getPaginatedDrawings } from "@/modules/drawings/service";
import { z } from "zod";
import { getCurrentUser, AuthError } from "@/lib/session";
import { mutationLimiter, getClientIdentifier } from "@/lib/rateLimit";

const CreateDrawingSchema = z.object({
    url: z.string().min(1, "URL is required"),
    version: z.number().int().min(1, "Version must be a positive integer"),
});

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const currentUser = await getCurrentUser();
        const { id: projectId } = await context.params;

        const { searchParams } = new URL(req.url);
        const cursor = searchParams.get("cursor");
        const limitParam = searchParams.get("limit");

        // Paginated mobile response
        if (cursor !== null || limitParam !== null) {
            const limit = limitParam ? parseInt(limitParam, 10) || 10 : 10;
            const result = await getPaginatedDrawings(projectId, currentUser, cursor, limit);
            if ("error" in result) {
                return NextResponse.json({ error: result.error }, { status: result.status });
            }
            return NextResponse.json({ items: result.items, nextCursor: result.nextCursor });
        }

        // Default: full response
        const result = await listProjectDrawings(projectId, currentUser);

        if ("error" in result) {
            return NextResponse.json({ error: result.error }, { status: result.status });
        }

        const response = NextResponse.json({ drawings: result.drawings });
        // Removed cache headers to enable instant UI updates on deletion.
        response.headers.set("Cache-Control", "no-store, max-age=0");
        return response;
    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const currentUser = await getCurrentUser();
        const { id: projectId } = await context.params;

        // Rate limiting
        const rl = mutationLimiter(getClientIdentifier(req, currentUser.id));
        if (!rl.allowed) {
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        const body = await req.json().catch(() => null);
        const parsed = CreateDrawingSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
        }

        const result = await createDrawing(projectId, parsed.data, currentUser);

        if ("error" in result) {
            return NextResponse.json({ error: result.error }, { status: result.status });
        }

        return NextResponse.json({ drawing: result.drawing }, { status: 201 });
    } catch (error) {
        console.error("[DRAWING_UPLOAD_ERROR]", error);
        if (error instanceof AuthError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        return NextResponse.json({ error: "Internal Server Error", detail: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}


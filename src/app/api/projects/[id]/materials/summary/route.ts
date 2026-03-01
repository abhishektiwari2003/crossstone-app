import { NextResponse } from "next/server";
import { getMaterialSummary } from "@/modules/materials/service";
import { getCurrentUser, AuthError } from "@/lib/session";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const currentUser = await getCurrentUser();
        const { id: projectId } = await params;

        const result = await getMaterialSummary(projectId, currentUser);

        if ("error" in result) {
            return NextResponse.json({ error: result.error }, { status: result.status });
        }

        const response = NextResponse.json(result.data);
        response.headers.set("Cache-Control", "public, max-age=60, stale-while-revalidate=120");
        return response;
    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error("GET /api/projects/[id]/materials/summary error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getMaterialSummary } from "@/modules/materials/service";
import type { AppRole } from "@/lib/authz";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: projectId } = await params;

        const result = await getMaterialSummary(projectId, session.user as { id: string; role: AppRole });

        if ("error" in result) {
            return NextResponse.json({ error: result.error }, { status: result.status });
        }

        return NextResponse.json(result.data);
    } catch (error) {
        console.error("GET /api/projects/[id]/materials/summary error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

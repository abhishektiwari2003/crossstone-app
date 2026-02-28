import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getProjectReport } from "@/modules/reports/service";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Await the params
        const { id: projectId } = await params;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const report = await getProjectReport(projectId, session.user as any);

        return NextResponse.json(report);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("GET /api/projects/[id]/report error:", error);
        if (message === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        if (message === "NOT_FOUND") {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

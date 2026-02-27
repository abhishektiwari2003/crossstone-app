import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getProjectReport } from "@/modules/reports/service";
import { User } from "@/generated/prisma";

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

        const report = await getProjectReport(projectId, session.user as User);

        return NextResponse.json(report);
    } catch (error: any) {
        console.error("GET /api/projects/[id]/report error:", error);
        if (error.message === "UNAUTHORIZED") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        if (error.message === "NOT_FOUND") {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

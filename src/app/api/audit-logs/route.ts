import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getAuditLogs } from "@/modules/audit/service";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!(session?.user as any)?.role) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);

        const filters = {
            projectId: searchParams.get("projectId") || undefined,
            userId: searchParams.get("userId") || undefined,
            action: searchParams.get("action") || undefined,
            from: searchParams.get("from") || undefined,
            to: searchParams.get("to") || undefined,
        };

        const cursor = searchParams.get("cursor");
        const limit = parseInt(searchParams.get("limit") || "20", 10);

        const result = await getAuditLogs((session?.user as any).role as any, filters, cursor, limit);

        if ("error" in result) {
            return NextResponse.json({ error: result.error }, { status: result.status });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("GET /api/audit-logs error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

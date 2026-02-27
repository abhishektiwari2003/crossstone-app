import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getAnalyticsDashboard } from "@/modules/analytics/service";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!(session?.user as any)?.role) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const from = searchParams.get("from") || undefined;
        const to = searchParams.get("to") || undefined;

        const result = await getAnalyticsDashboard((session?.user as any).role as any, from, to);

        if ("error" in result) {
            return NextResponse.json({ error: result.error }, { status: result.status });
        }

        return NextResponse.json(result.data);
    } catch (error) {
        console.error("GET /api/analytics error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

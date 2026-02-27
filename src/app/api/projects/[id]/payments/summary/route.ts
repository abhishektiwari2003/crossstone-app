import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getPaymentSummary } from "@/modules/payments/service";

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

        const result = await getPaymentSummary(projectId, session.user as any);

        if ("error" in result) {
            return NextResponse.json({ error: result.error }, { status: result.status });
        }

        return NextResponse.json(result.data);
    } catch (error) {
        console.error("GET /api/projects/[id]/payments/summary error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

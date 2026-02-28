import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getFilteredPayments } from "@/modules/payments/service";
import { PaymentStatus, PaymentCategory } from "@/generated/prisma";
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
        const { searchParams } = new URL(req.url);

        const filters = {
            status: (searchParams.get("status") as PaymentStatus) || undefined,
            category: (searchParams.get("category") as PaymentCategory) || undefined,
            from: searchParams.get("from") || undefined,
            to: searchParams.get("to") || undefined,
        };

        const cursor = searchParams.get("cursor");
        const limit = parseInt(searchParams.get("limit") || "20", 10);

        const result = await getFilteredPayments(projectId, filters, cursor, limit, session.user as { id: string; role: AppRole });

        if ("error" in result) {
            return NextResponse.json({ error: result.error }, { status: result.status });
        }

        return NextResponse.json(result.data);
    } catch (error) {
        console.error("GET /api/projects/[id]/payments error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

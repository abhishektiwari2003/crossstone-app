import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { bulkUpdatePayments } from "@/modules/payments/service";

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { paymentIds, status } = body;

        if (!Array.isArray(paymentIds) || !status) {
            return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
        }

        const result = await bulkUpdatePayments(paymentIds, status as any, session.user as any);

        if ("error" in result) {
            return NextResponse.json({ error: result.error }, { status: result.status });
        }

        return NextResponse.json(result.data);
    } catch (error) {
        console.error("PATCH /api/payments/bulk error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

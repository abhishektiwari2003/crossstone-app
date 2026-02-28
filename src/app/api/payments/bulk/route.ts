import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { bulkUpdatePayments } from "@/modules/payments/service";
import type { PaymentStatus } from "@/generated/prisma";
import type { AppRole } from "@/lib/authz";

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

        const result = await bulkUpdatePayments(paymentIds, status as PaymentStatus, session.user as { id: string; role: AppRole });

        if ("error" in result) {
            return NextResponse.json({ error: result.error }, { status: result.status });
        }

        return NextResponse.json(result.data);
    } catch (error) {
        console.error("PATCH /api/payments/bulk error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

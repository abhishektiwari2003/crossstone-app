import { NextResponse } from "next/server";
import { bulkUpdatePayments } from "@/modules/payments/service";
import type { PaymentStatus } from "@/generated/prisma";
import { getCurrentUser, AuthError } from "@/lib/session";
import { mutationLimiter, getClientIdentifier } from "@/lib/rateLimit";

export async function PATCH(req: Request) {
    try {
        const currentUser = await getCurrentUser();

        // Rate limiting
        const rl = mutationLimiter(getClientIdentifier(req, currentUser.id));
        if (!rl.allowed) {
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        const body = await req.json();
        const { paymentIds, status } = body;

        if (!Array.isArray(paymentIds) || !status) {
            return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
        }

        const result = await bulkUpdatePayments(paymentIds, status as PaymentStatus, currentUser);

        if ("error" in result) {
            return NextResponse.json({ error: result.error }, { status: result.status });
        }

        return NextResponse.json(result.data);
    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error("PATCH /api/payments/bulk error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


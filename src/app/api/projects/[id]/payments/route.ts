import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getFilteredPayments, createPayment } from "@/modules/payments/service";
import { PaymentStatus, PaymentCategory } from "@/generated/prisma";
import type { AppRole } from "@/lib/authz";
import { z } from "zod";

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


const createPaymentSchema = z.object({
    amount: z.number().positive(),
    status: z.nativeEnum(PaymentStatus),
    currency: z.string().default("INR"),
    category: z.nativeEnum(PaymentCategory).optional().nullable(),
    invoiceNumber: z.string().max(50).optional().nullable(),
    notes: z.string().max(500).optional().nullable(),
    dueDate: z.string().optional().nullable(),
    paidAt: z.string().optional().nullable(),
});

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: projectId } = await params;
        const body = await req.json();

        const parseResult = createPaymentSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({ error: "Invalid payload Data", details: parseResult.error.format() }, { status: 400 });
        }

        const result = await createPayment(projectId, parseResult.data, session.user as { id: string; role: AppRole });

        if ("error" in result) {
            return NextResponse.json({ error: result.error }, { status: result.status });
        }

        return NextResponse.json({ payment: result.data }, { status: 201 });
    } catch (error) {
        console.error("POST /api/projects/[id]/payments error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

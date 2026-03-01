import { NextResponse } from "next/server";
import { CreateInspectionSchema } from "@/modules/inspections/validation";
import { createInspection } from "@/modules/inspections/service";
import { getCurrentUser, AuthError } from "@/lib/session";
import { mutationLimiter, getClientIdentifier } from "@/lib/rateLimit";

export async function POST(req: Request) {
    try {
        const currentUser = await getCurrentUser();

        // Rate limiting
        const rl = mutationLimiter(getClientIdentifier(req, currentUser.id));
        if (!rl.allowed) {
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        const body = await req.json().catch(() => null);
        const parsed = CreateInspectionSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
        }

        const result = await createInspection(parsed.data, currentUser);

        if ("error" in result) {
            return NextResponse.json({ error: result.error }, { status: result.status });
        }

        return NextResponse.json({ inspection: result.inspection }, { status: 201 });
    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


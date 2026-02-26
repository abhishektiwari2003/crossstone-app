import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Role } from "@/generated/prisma";
import type { AppRole } from "@/lib/authz";
import { CreateInspectionSchema } from "@/modules/inspections/validation";
import { createInspection } from "@/modules/inspections/service";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = session.user as { id: string; role?: Role };

    const body = await req.json().catch(() => null);
    const parsed = CreateInspectionSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
    }

    const result = await createInspection(parsed.data, {
        id: currentUser.id,
        role: currentUser.role as AppRole,
    });

    if ("error" in result) {
        return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ inspection: result.inspection }, { status: 201 });
}

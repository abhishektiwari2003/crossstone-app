import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Role } from "@/generated/prisma";
import type { AppRole } from "@/lib/authz";
import { UpdateQuerySchema } from "@/modules/queries/validation";
import { getQueryById, updateQuery } from "@/modules/queries/service";

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = session.user as { id: string; role?: Role };
    const { id: queryId } = await context.params;

    const result = await getQueryById(queryId, {
        id: currentUser.id,
        role: currentUser.role as AppRole,
    });

    if ("error" in result) {
        return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ query: result.query });
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = session.user as { id: string; role?: Role };
    const { id: queryId } = await context.params;

    const body = await req.json().catch(() => null);
    const parsed = UpdateQuerySchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
    }

    const result = await updateQuery(queryId, parsed.data, {
        id: currentUser.id,
        role: currentUser.role as AppRole,
    });

    if ("error" in result) {
        return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ query: result.query });
}

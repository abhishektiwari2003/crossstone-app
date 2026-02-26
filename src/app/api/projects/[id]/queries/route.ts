import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Role } from "@/generated/prisma";
import type { AppRole } from "@/lib/authz";
import { CreateQuerySchema } from "@/modules/queries/validation";
import { createQuery, getPaginatedProjectQueries } from "@/modules/queries/service";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = session.user as { id: string; role?: Role };
    const { id: projectId } = await context.params;

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) || 10 : 10;

    const result = await getPaginatedProjectQueries(
        projectId,
        { id: currentUser.id, role: currentUser.role as AppRole },
        cursor,
        limit
    );

    if ("error" in result) {
        return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ items: result.items, nextCursor: result.nextCursor });
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = session.user as { id: string; role?: Role };
    const { id: projectId } = await context.params;

    const body = await req.json().catch(() => null);
    const parsed = CreateQuerySchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
    }

    const result = await createQuery(projectId, parsed.data, {
        id: currentUser.id,
        role: currentUser.role as AppRole,
    });

    if ("error" in result) {
        return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ query: result.query }, { status: 201 });
}

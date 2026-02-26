import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Role } from "@/generated/prisma";
import type { AppRole } from "@/lib/authz";
import { getProjectInspections, getPaginatedProjectInspections } from "@/modules/inspections/service";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = session.user as { id: string; role?: Role };
    const { id: projectId } = await context.params;

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limitParam = searchParams.get("limit");

    // Paginated mobile response
    if (cursor !== null || limitParam !== null) {
        const limit = limitParam ? parseInt(limitParam, 10) || 10 : 10;
        const result = await getPaginatedProjectInspections(
            projectId,
            { id: currentUser.id, role: currentUser.role as AppRole },
            cursor,
            limit
        );
        return NextResponse.json(result);
    }

    // Default: full response
    const inspections = await getProjectInspections(projectId, {
        id: currentUser.id,
        role: currentUser.role as AppRole,
    });
    return NextResponse.json({ inspections });
}

import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Role } from "@/generated/prisma";
import type { AppRole } from "@/lib/authz";
import { getProjectInspections } from "@/modules/inspections/service";

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = session.user as { id: string; role?: Role };
    const { id: projectId } = await context.params;

    const inspections = await getProjectInspections(projectId, {
        id: currentUser.id,
        role: currentUser.role as AppRole,
    });

    return NextResponse.json({ inspections });
}

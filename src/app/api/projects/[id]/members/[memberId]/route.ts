import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Role } from "@/generated/prisma";
import { removeMember } from "@/modules/projects/service";
import type { AppRole } from "@/lib/authz";

export async function DELETE(
    _: NextRequest,
    context: { params: Promise<{ id: string; memberId: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = session.user as { id: string; role?: Role };
    const { id: projectId, memberId } = await context.params;

    const result = await removeMember(
        projectId,
        memberId,
        { id: currentUser.id, role: currentUser.role as AppRole }
    );

    if ("error" in result) {
        return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ message: result.message });
}

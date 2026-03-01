import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserProfileData, canViewUserProfile } from "@/modules/users/service";
import type { AppRole } from "@/lib/authz";

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = session.user as { id: string; role?: string };
    const { id: targetUserId } = await context.params;

    if (!canViewUserProfile({ id: currentUser.id, role: currentUser.role as AppRole }, targetUserId)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await getUserProfileData(targetUserId);

    if (!data) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(data);
}

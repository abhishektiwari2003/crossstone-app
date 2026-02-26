import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Role } from "@/generated/prisma";
import type { AppRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/authz";

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = session.user as { id: string; role?: Role };
    const role = currentUser.role as AppRole;
    const { id: drawingId } = await context.params;

    const media = await prisma.media.findUnique({ where: { id: drawingId } });
    if (!media) return NextResponse.json({ error: "Drawing not found" }, { status: 404 });
    if (media.type !== "DRAWING") return NextResponse.json({ error: "Not a drawing" }, { status: 400 });

    // Approved drawings: only SUPER_ADMIN
    if (media.approvedAt && role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Only Super Admin can delete approved drawings" }, { status: 403 });
    }

    // Draft drawings: any admin
    if (!isAdmin(role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.media.delete({ where: { id: drawingId } });

    return NextResponse.json({ success: true });
}

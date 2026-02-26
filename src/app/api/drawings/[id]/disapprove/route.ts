import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Role } from "@/generated/prisma";
import type { AppRole } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/authz";

export async function PATCH(_: NextRequest, context: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = session.user as { id: string; role?: Role };
    const { id: drawingId } = await context.params;

    if (!isAdmin(currentUser.role as AppRole)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const media = await prisma.media.findUnique({ where: { id: drawingId } });
    if (!media) return NextResponse.json({ error: "Drawing not found" }, { status: 404 });
    if (media.type !== "DRAWING") return NextResponse.json({ error: "Not a drawing" }, { status: 400 });
    if (!media.approvedAt) return NextResponse.json({ error: "Drawing is not approved" }, { status: 400 });

    const updated = await prisma.media.update({
        where: { id: drawingId },
        data: { approvedBy: null, approvedAt: null },
        include: { createdBy: { select: { id: true, name: true } } },
    });

    return NextResponse.json({
        drawing: {
            id: updated.id,
            url: updated.fileUrl,
            version: updated.version,
            approvedAt: updated.approvedAt,
            approvedBy: updated.approvedBy,
            createdAt: updated.createdAt,
            uploadedBy: updated.createdBy,
        },
    });
}

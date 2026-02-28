import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Security: Make sure the notification belongs to the calling user
        const notification = await prisma.notification.findUnique({
            where: { id },
        });

        if (!notification) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        if (notification.userId !== (session.user as any).id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const updated = await prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("PATCH /api/notifications/[id]/read error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

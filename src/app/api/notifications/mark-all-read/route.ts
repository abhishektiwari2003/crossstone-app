import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Security: Only mark the current user's unread notifications
        const result = await prisma.notification.updateMany({
            where: {
                userId: (session.user as any).id,
                isRead: false,
            },
            data: { isRead: true },
        });

        return NextResponse.json({ updatedCount: result.count });
    } catch (error) {
        console.error("PATCH /api/notifications/mark-all-read error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const cursor = searchParams.get("cursor");
        const limit = parseInt(searchParams.get("limit") || "20", 10);
        const take = Math.min(limit, 100);

        // 1. Fetch paginated notifications
        const items = await prisma.notification.findMany({
            where: { userId: (session.user as any).id },
            take: take + 1,
            cursor: cursor ? { id: cursor } : undefined,
            skip: cursor ? 1 : 0,
            orderBy: { createdAt: "desc" },
        });

        // 2. Fetch total unread count (for the badge)
        const unreadCount = await prisma.notification.count({
            where: { userId: (session.user as any).id, isRead: false },
        });

        const hasMore = items.length > take;
        const paginatedItems = hasMore ? items.slice(0, take) : items;
        const nextCursor = hasMore ? paginatedItems[paginatedItems.length - 1].id : null;

        return NextResponse.json({
            items: paginatedItems,
            unreadCount,
            nextCursor,
        });
    } catch (error) {
        console.error("GET /api/notifications error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const preferencesSchema = z.object({
    inspectionSubmitted: z.boolean().optional(),
    paymentOverdue: z.boolean().optional(),
    newAssignment: z.boolean().optional(),
    queryCreated: z.boolean().optional(),
    drawingApproved: z.boolean().optional(),
    emailEnabled: z.boolean().optional(),
    inAppEnabled: z.boolean().optional(),
});

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let prefs = await prisma.notificationPreference.findUnique({
            where: { userId: (session.user as any).id },
        });

        // Auto-initialize if strictly missing
        if (!prefs) {
            prefs = await prisma.notificationPreference.create({
                data: { userId: (session.user as any).id },
            });
        }

        return NextResponse.json(prefs);
    } catch (error) {
        console.error("GET /api/notifications/preferences error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validation = preferencesSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Invalid preference data", details: validation.error.format() },
                { status: 400 }
            );
        }

        const updated = await prisma.notificationPreference.upsert({
            where: { userId: (session.user as any).id },
            update: validation.data,
            create: {
                userId: (session.user as any).id,
                ...validation.data, // fallback payload
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("PATCH /api/notifications/preferences error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

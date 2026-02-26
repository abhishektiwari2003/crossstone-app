import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Role } from "@/generated/prisma";
import type { AppRole } from "@/lib/authz";
import { CreateMilestoneSchema } from "@/modules/milestones/validation";
import { createMilestone, getProjectMilestones } from "@/modules/milestones/service";

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: projectId } = await context.params;
    const milestones = await getProjectMilestones(projectId);
    return NextResponse.json({ milestones });
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = session.user as { id: string; role?: Role };
    const { id: projectId } = await context.params;

    const body = await req.json().catch(() => null);
    const parsed = CreateMilestoneSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
    }

    const result = await createMilestone(projectId, parsed.data, {
        id: currentUser.id,
        role: currentUser.role as AppRole,
    });

    if ("error" in result) {
        return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ milestone: result.milestone }, { status: 201 });
}

import { NextResponse, type NextRequest } from "next/server";
import { CreateMilestoneSchema } from "@/modules/milestones/validation";
import { createMilestone, getProjectMilestones } from "@/modules/milestones/service";
import { getCurrentUser, AuthError } from "@/lib/session";
import { mutationLimiter, getClientIdentifier } from "@/lib/rateLimit";

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        await getCurrentUser();
        const { id: projectId } = await context.params;
        const milestones = await getProjectMilestones(projectId);

        const response = NextResponse.json({ milestones });
        response.headers.set("Cache-Control", "public, max-age=60, stale-while-revalidate=120");
        return response;
    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const currentUser = await getCurrentUser();
        const { id: projectId } = await context.params;

        // Rate limiting
        const rl = mutationLimiter(getClientIdentifier(req, currentUser.id));
        if (!rl.allowed) {
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        const body = await req.json().catch(() => null);
        const parsed = CreateMilestoneSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
        }

        const result = await createMilestone(projectId, parsed.data, currentUser);

        if ("error" in result) {
            return NextResponse.json({ error: result.error }, { status: result.status });
        }

        return NextResponse.json({ milestone: result.milestone }, { status: 201 });
    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


import { NextResponse, type NextRequest } from "next/server";
import { importMilestonesFromCsv } from "@/modules/milestones/service";
import { getCurrentUser, AuthError } from "@/lib/session";
import { mutationLimiter, getClientIdentifier } from "@/lib/rateLimit";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const currentUser = await getCurrentUser();
        const { id: projectId } = await context.params;

        const rl = mutationLimiter(getClientIdentifier(req, currentUser.id));
        if (!rl.allowed) {
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        const ct = req.headers.get("content-type") || "";
        let csvText: string;

        if (ct.includes("multipart/form-data")) {
            const form = await req.formData();
            const file = form.get("file");
            if (!file || typeof file === "string") {
                return NextResponse.json({ error: "Expected file field" }, { status: 400 });
            }
            csvText = await (file as File).text();
        } else {
            csvText = await req.text();
            if (!csvText.trim()) {
                return NextResponse.json({ error: "Empty body" }, { status: 400 });
            }
        }

        const result = await importMilestonesFromCsv(projectId, csvText, {
            id: currentUser.id,
            role: currentUser.role,
        });

        if ("error" in result) {
            return NextResponse.json({ error: result.error }, { status: result.status });
        }

        return NextResponse.json({
            milestonesCreated: result.milestonesCreated,
            checklistItemsCreated: result.checklistItemsCreated,
            errors: result.errors,
        });
    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

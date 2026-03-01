import { NextResponse, type NextRequest } from "next/server";
import { getProjectContacts } from "@/modules/contacts/service";
import { getCurrentUser, AuthError } from "@/lib/session";

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const currentUser = await getCurrentUser();
        const { id: projectId } = await context.params;

        const result = await getProjectContacts(projectId, currentUser);

        if ("error" in result) {
            return NextResponse.json({ error: result.error }, { status: result.status });
        }

        const response = NextResponse.json({ contacts: result.contacts });
        response.headers.set("Cache-Control", "public, max-age=60, stale-while-revalidate=120");
        return response;
    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error("[contacts] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}


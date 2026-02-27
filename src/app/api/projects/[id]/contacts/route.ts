import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Role } from "@/generated/prisma";
import type { AppRole } from "@/lib/authz";
import { getProjectContacts } from "@/modules/contacts/service";

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = session.user as { id: string; role?: Role };
    const { id: projectId } = await context.params;

    try {
        const result = await getProjectContacts(projectId, {
            id: currentUser.id,
            role: currentUser.role as AppRole,
        });

        if ("error" in result) {
            return NextResponse.json({ error: result.error }, { status: result.status });
        }

        return NextResponse.json({ contacts: result.contacts });
    } catch (error) {
        console.error("[contacts] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

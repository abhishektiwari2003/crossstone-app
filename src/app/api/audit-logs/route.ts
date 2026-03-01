import { NextResponse } from "next/server";
import { getAuditLogs } from "@/modules/audit/service";
import { getCurrentUser, AuthError } from "@/lib/session";
import { isAdmin } from "@/lib/authz";

export async function GET(req: Request) {
    try {
        const currentUser = await getCurrentUser();

        // Audit logs are ADMIN-only (write-only for non-admins)
        if (!isAdmin(currentUser.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);

        const filters = {
            projectId: searchParams.get("projectId") || undefined,
            userId: searchParams.get("userId") || undefined,
            action: searchParams.get("action") || undefined,
            from: searchParams.get("from") || undefined,
            to: searchParams.get("to") || undefined,
        };

        const cursor = searchParams.get("cursor");
        const limit = parseInt(searchParams.get("limit") || "20", 10);

        const result = await getAuditLogs(currentUser.role, filters, cursor, limit);

        if ("error" in result) {
            return NextResponse.json({ error: result.error }, { status: result.status });
        }

        return NextResponse.json(result);
    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error("GET /api/audit-logs error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


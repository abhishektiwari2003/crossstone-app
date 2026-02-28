import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getProjectMaterials, createMaterial } from "@/modules/materials/service";
import type { MaterialStatus } from "@/generated/prisma";
import type { AppRole } from "@/lib/authz";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: projectId } = await params;
        const { searchParams } = new URL(req.url);

        const filters = {
            status: (searchParams.get("status") as MaterialStatus) || undefined,
        };

        const cursor = searchParams.get("cursor");
        const limit = parseInt(searchParams.get("limit") || "20", 10);

        const result = await getProjectMaterials(projectId, filters, cursor, limit, session.user as { id: string; role: AppRole });

        if ("error" in result) {
            return NextResponse.json({ error: result.error }, { status: result.status });
        }

        return NextResponse.json(result.data);
    } catch (error) {
        console.error("GET /api/projects/[id]/materials error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: projectId } = await params;
        const body = await req.json();

        const result = await createMaterial(projectId, body, session.user as { id: string; role: AppRole });

        if ("error" in result) {
            return NextResponse.json({ error: result.error }, { status: result.status });
        }

        return NextResponse.json(result.data, { status: 201 });
    } catch (error) {
        console.error("POST /api/projects/[id]/materials error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

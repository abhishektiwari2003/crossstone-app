import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { generateProjectReportPDF } from "@/modules/reports/service";
import { User } from "@/generated/prisma";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id: projectId } = await params;

        // Generate the PDF stream
        const pdfStream = await generateProjectReportPDF(projectId, session.user as User);

        // Convert NodeJS stream to Web stream
        const body = new ReadableStream({
            start(controller) {
                pdfStream.on("data", (chunk: Uint8Array) => controller.enqueue(chunk));
                pdfStream.on("end", () => controller.close());
                pdfStream.on("error", (err: Error) => controller.error(err));
            },
            cancel() {
                // Avoid memory leaks
                (pdfStream as any).destroy();
            },
        });

        return new NextResponse(body, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="project-report-${projectId}.pdf"`,
            },
        });
    } catch (error: any) {
        console.error("GET /api/projects/[id]/report/export error:", error);
        if (error.message === "UNAUTHORIZED") {
            return new NextResponse("Forbidden", { status: 403 });
        }
        if (error.message === "NOT_FOUND") {
            return new NextResponse("Project not found", { status: 404 });
        }
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

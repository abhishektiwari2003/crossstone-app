import { prisma } from "./src/lib/prisma";

async function main() {
    try {
        const currentUser = await prisma.user.findFirst({
            where: { role: "ADMIN" }
        });

        const project = await prisma.project.findFirst();

        if (!currentUser || !project) {
            console.error("Missing user or project");
            return;
        }

        const drawing = await prisma.media.create({
            data: {
                projectId: project.id,
                type: "DRAWING",
                fileKey: "test-url",
                fileUrl: "test-url",
                mimeType: "application/pdf",
                fileSize: 0,
                createdById: currentUser.id,
                version: 1,
            },
        });

        console.log("Success:", drawing);
    } catch (e) {
        console.error("Error creating media:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(console.error);

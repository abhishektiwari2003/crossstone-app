import { createDrawing } from "./src/modules/drawings/service";
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

        console.log("Calling createDrawing...");
        const result = await createDrawing(
            project.id,
            { url: "https://example.com/drawing.pdf", version: 2 },
            { id: currentUser.id, role: currentUser.role }
        );
        console.log("Result:", result);
    } catch (e) {
        console.error("Caught error in createDrawing:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(console.error);

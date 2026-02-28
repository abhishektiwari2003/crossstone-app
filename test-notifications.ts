import { prisma } from "./src/lib/prisma";

async function verifyNotifications() {
    try {
        console.log("Checking Notifications DB...");

        // Let's create a test notification for the top admin
        const adminUser = await prisma.user.findFirst({
            where: { role: "ADMIN" }
        });

        if (adminUser) {
            console.log(`Creating test notification for ${adminUser.email}...`);
            await prisma.notification.create({
                data: {
                    userId: adminUser.id,
                    title: "Test Alert",
                    message: "This is a test notification to verify the bell UI.",
                    type: "SYSTEM",
                    actionUrl: "/settings/notifications",
                    priority: "HIGH"
                }
            });
            console.log("Created test notification successfully!");

            const count = await prisma.notification.count({
                where: { userId: adminUser.id, readAt: null }
            });
            console.log(`Total unread for this user: ${count}`);
        } else {
            console.log("No ADMIN user found to test with.");
        }
    } catch (e) {
        console.error("Error creating test notification:", e);
    } finally {
        await prisma.$disconnect();
    }
}

verifyNotifications();

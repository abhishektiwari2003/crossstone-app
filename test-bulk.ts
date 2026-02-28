import { bulkUpdatePayments } from "./src/modules/payments/service";
import { prisma } from "./src/lib/prisma";

async function run() {
    try {
        console.log("Fetching some payments to test...");
        const payment = await prisma.payment.findFirst();
        if (!payment) {
            console.log("No payments in DB!");
            return;
        }

        console.log(`Testing with payment ID: ${payment.id}`);
        // Calling the exact service the endpoint uses:
        const currentUser = { id: "test-admin-id", role: "ADMIN" as any };

        const result = await bulkUpdatePayments([payment.id], "PAID", currentUser);
        console.log("Result:", result);
    } catch (e) {
        console.error("CAUGHT EXCEPTION:", e);
    } finally {
        await prisma.$disconnect();
    }
}

run();

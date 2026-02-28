import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma";

export async function createNotification(params: {
	userId: string;
	title: string;
	message: string;
	type?: string;
	data?: Record<string, unknown>;
}) {
	return prisma.notification.create({
		data: {
			userId: params.userId,
			title: params.title,
			message: params.message,
			type: params.type || "GENERIC",
		},
	});
}

export async function sendWhatsAppMock(params: { to: string; message: string }) {
	// Placeholder no-op implementation for future automation
	console.log(`[whatsapp:mock] to=${params.to} message=${params.message}`);
}

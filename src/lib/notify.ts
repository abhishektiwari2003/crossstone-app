import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma";

export async function createNotification(params: {
	userId: string;
	title: string;
	body: string;
	type?: string;
	data?: Record<string, unknown>;
}) {
	return prisma.notification.create({
		data: {
			userId: params.userId,
			title: params.title,
			body: params.body,
			type: params.type || "GENERIC",
			data: (params.data as unknown as Prisma.InputJsonValue) ?? undefined,
		},
	});
}

export async function sendWhatsAppMock(params: { to: string; message: string }) {
	// Placeholder no-op implementation for future automation
	console.log(`[whatsapp:mock] to=${params.to} message=${params.message}`);
}

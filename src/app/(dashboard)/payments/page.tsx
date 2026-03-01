import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Role } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import PaymentsClient from "./PaymentsClient";

const includeProject = {
	project: {
		select: {
			id: true,
			name: true,
			client: { select: { id: true, name: true, email: true } },
		},
	},
} as const;

async function getPayments(userId: string, role: Role) {
	if (role === "CLIENT") {
		return prisma.payment.findMany({ where: { project: { clientId: userId } }, include: includeProject });
	}
	if (role === "PROJECT_MANAGER" || role === "SITE_ENGINEER") {
		return prisma.payment.findMany({ where: { project: { OR: [{ managerId: userId }, { members: { some: { userId } } }] } }, include: includeProject });
	}
	return prisma.payment.findMany({ include: includeProject });
}



export default async function PaymentsPage() {
	const session = await getServerSession(authOptions);
	if (!session?.user) return null;
	const role = (session.user as { role?: Role }).role as Role;
	const userId = (session.user as { id: string }).id;
	const payments = await getPayments(userId, role);

	const showMaster = role === "SUPER_ADMIN" || role === "ADMIN" || role === "PROJECT_MANAGER";

	const serializedPayments = payments.map((p) => ({
		...p,
		amount: Number(p.amount),
	}));

	return (
		<PaymentsClient initialPayments={serializedPayments as any[]} role={role} />
	);
}

import { PrismaClient, Role, ProjectStatus } from "@/generated/prisma";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
	const password = await bcrypt.hash("admin123", 10);
	const superAdmin = await prisma.user.upsert({
		where: { email: "superadmin@crossstone.local" },
		update: {},
		create: { name: "Super Admin", email: "superadmin@crossstone.local", role: Role.SUPER_ADMIN, passwordHash: password },
	});

	const client = await prisma.user.upsert({
		where: { email: "client@crossstone.local" },
		update: {},
		create: { name: "Client", email: "client@crossstone.local", role: Role.CLIENT, passwordHash: password, createdById: superAdmin.id },
	});

	const pm = await prisma.user.upsert({
		where: { email: "pm@crossstone.local" },
		update: {},
		create: { name: "Project Manager", email: "pm@crossstone.local", role: Role.PROJECT_MANAGER, passwordHash: password, createdById: superAdmin.id },
	});

	const project = await prisma.project.upsert({
		where: { id: "demo-project" },
		update: {},
		create: {
			id: "demo-project",
			name: "Demo Project",
			description: "Sample project",
			status: ProjectStatus.IN_PROGRESS,
			createdById: superAdmin.id,
			managerId: pm.id,
			clientId: client.id,
		},
	});

	await prisma.projectMember.upsert({
		where: { projectId_userId: { projectId: project.id, userId: pm.id } },
		update: {},
		create: { projectId: project.id, userId: pm.id, roleOnProject: "PM" },
	});

	console.log("Seeded:", { superAdmin: superAdmin.email, pm: pm.email, client: client.email, project: project.name });
}

main().finally(async () => {
	await prisma.$disconnect();
});

import { PrismaClient, Role, ProjectStatus, ProjectMemberRole } from "../src/generated/prisma";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
	const password = await bcrypt.hash("admin123", 10);
	const superAdmin = await prisma.user.upsert({
		where: { email: "superadmin@crossstone.local" },
		update: { passwordHash: password },
		create: { name: "Super Admin", email: "superadmin@crossstone.local", role: Role.SUPER_ADMIN, passwordHash: password },
	});

	const client = await prisma.user.upsert({
		where: { email: "client@crossstone.local" },
		update: { passwordHash: password },
		create: { name: "Client", email: "client@crossstone.local", role: Role.CLIENT, passwordHash: password, createdById: superAdmin.id },
	});

	const pm = await prisma.user.upsert({
		where: { email: "pm@crossstone.local" },
		update: { passwordHash: password },
		create: { name: "Project Manager", email: "pm@crossstone.local", role: Role.PROJECT_MANAGER, passwordHash: password, createdById: superAdmin.id },
	});

	const engineer = await prisma.user.upsert({
		where: { email: "engineer@crossstone.local" },
		update: { passwordHash: password },
		create: { name: "Site Engineer", email: "engineer@crossstone.local", role: Role.SITE_ENGINEER, passwordHash: password, createdById: superAdmin.id },
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
		create: { projectId: project.id, userId: pm.id, role: ProjectMemberRole.PROJECT_MANAGER },
	});

	await prisma.projectMember.upsert({
		where: { projectId_userId: { projectId: project.id, userId: engineer.id } },
		update: {},
		create: { projectId: project.id, userId: engineer.id, role: ProjectMemberRole.SITE_ENGINEER },
	});

	console.log("Seeded:", { superAdmin: superAdmin.email, pm: pm.email, engineer: engineer.email, client: client.email, project: project.name });
}

main().finally(async () => {
	await prisma.$disconnect();
});

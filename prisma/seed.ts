import {
	PrismaClient,
	Role,
	ProjectStatus,
	ProjectMemberRole,
	QueryPriority,
	QueryStatus,
} from "../src/generated/prisma_new";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
	const password = await bcrypt.hash("admin123", 10);

	// ─── Users ───
	const superAdmin = await prisma.user.upsert({
		where: { email: "superadmin@crossstone.local" },
		update: { passwordHash: password },
		create: { name: "Super Admin", email: "superadmin@crossstone.local", role: Role.SUPER_ADMIN, passwordHash: password },
	});

	const client = await prisma.user.upsert({
		where: { email: "client@crossstone.local" },
		update: {
			passwordHash: password,
			name: "Amit Patel",
		},
		create: {
			name: "Amit Patel",
			email: "client@crossstone.local",
			role: Role.CLIENT,
			passwordHash: password,
			createdById: superAdmin.id,
		},
	});

	const admin = await prisma.user.upsert({
		where: { email: "admin@crossstone.local" },
		update: {
			passwordHash: password,
			name: "Rahul Verma",
		},
		create: {
			name: "Rahul Verma",
			email: "admin@crossstone.local",
			role: Role.ADMIN,
			passwordHash: password,
			createdById: superAdmin.id,
		},
	});

	const pm = await prisma.user.upsert({
		where: { email: "pm@crossstone.local" },
		update: {
			passwordHash: password,
			name: "Priya Sharma",
		},
		create: {
			name: "Priya Sharma",
			email: "pm@crossstone.local",
			role: Role.PROJECT_MANAGER,
			passwordHash: password,
			createdById: superAdmin.id,
		},
	});

	const engineer = await prisma.user.upsert({
		where: { email: "engineer@crossstone.local" },
		update: {
			passwordHash: password,
			name: "Vikram Singh",
		},
		create: {
			name: "Vikram Singh",
			email: "engineer@crossstone.local",
			role: Role.SITE_ENGINEER,
			passwordHash: password,
			createdById: superAdmin.id,
		},
	});

	// ─── Project 1: Greenfield Villa ───
	const project1 = await prisma.project.upsert({
		where: { id: "project-greenfield" },
		update: {
			totalValue: 4_85_00_000,
			siteLatitude: 12.9716,
			siteLongitude: 77.5946,
			geofenceRadiusMeters: 500,
			siteLabel: "Whitefield demo coordinates",
		},
		create: {
			id: "project-greenfield",
			name: "Greenfield Villa Construction",
			description:
				"Premium 4BHK villa construction at Whitefield, Bangalore. Total area 3200 sq ft with modern amenities, landscaped garden, and rooftop terrace.",
			status: ProjectStatus.IN_PROGRESS,
			totalValue: 4_85_00_000,
			createdById: superAdmin.id,
			managerId: pm.id,
			clientId: client.id,
			siteLatitude: 12.9716,
			siteLongitude: 77.5946,
			geofenceRadiusMeters: 500,
			siteLabel: "Whitefield demo coordinates",
		},
	});

	// ─── Project 2: Sunrise Apartments ───
	const project2 = await prisma.project.upsert({
		where: { id: "project-sunrise" },
		update: { totalValue: 12_40_00_000 },
		create: {
			id: "project-sunrise",
			name: "Sunrise Apartments Phase 2",
			description:
				"Residential apartment complex with 48 flats across 6 floors. Located in Koramangala with underground parking and rooftop amenities.",
			status: ProjectStatus.PLANNED,
			totalValue: 12_40_00_000,
			createdById: superAdmin.id,
			managerId: pm.id,
			clientId: client.id,
		},
	});

	// ─── Project Members ───
	const memberPairs = [
		{ projectId: project1.id, userId: pm.id, role: ProjectMemberRole.PROJECT_MANAGER },
		{ projectId: project1.id, userId: engineer.id, role: ProjectMemberRole.SITE_ENGINEER },
		{ projectId: project2.id, userId: pm.id, role: ProjectMemberRole.PROJECT_MANAGER },
		{ projectId: project2.id, userId: engineer.id, role: ProjectMemberRole.SITE_ENGINEER },
	];

	for (const m of memberPairs) {
		await prisma.projectMember.upsert({
			where: { projectId_userId: { projectId: m.projectId, userId: m.userId } },
			update: {},
			create: m,
		});
	}

	// ─── Milestones for Project 1 ───
	const milestone1 = await prisma.milestone.create({
		data: {
			name: "Foundation Work",
			description: "Excavation, PCC, footings, and plinth beam construction",
			order: 1,
			projectId: project1.id,
		},
	});

	const milestone2 = await prisma.milestone.create({
		data: {
			name: "Structural Frame",
			description: "Column, beam, and slab construction for all floors",
			order: 2,
			projectId: project1.id,
		},
	});

	const milestone3 = await prisma.milestone.create({
		data: {
			name: "Brick Work & Plastering",
			description: "Wall construction, internal/external plastering",
			order: 3,
			projectId: project1.id,
		},
	});

	// ─── Checklist Items for each milestone ───
	const foundationChecks = [
		"Soil testing report verified",
		"Excavation depth as per drawing",
		"PCC level checked with theodolite",
		"Reinforcement layout matches design",
		"Concrete grade & slump test done",
	];

	for (let i = 0; i < foundationChecks.length; i++) {
		await prisma.checklistItem.create({
			data: {
				title: foundationChecks[i],
				order: i + 1,
				isRequired: true,
				milestoneId: milestone1.id,
			},
		});
	}

	const structuralChecks = [
		"Column reinforcement verified",
		"Beam dimensions as per drawing",
		"Slab thickness checked",
		"Concrete cube samples collected",
		"Curing schedule maintained",
	];

	for (let i = 0; i < structuralChecks.length; i++) {
		await prisma.checklistItem.create({
			data: {
				title: structuralChecks[i],
				order: i + 1,
				isRequired: true,
				milestoneId: milestone2.id,
			},
		});
	}

	const brickworkChecks = [
		"Brick quality approved",
		"Mortar ratio correct (1:6)",
		"Wall plumbness checked",
		"Window/door openings aligned",
		"Plaster thickness uniform",
	];

	for (let i = 0; i < brickworkChecks.length; i++) {
		await prisma.checklistItem.create({
			data: {
				title: brickworkChecks[i],
				order: i + 1,
				isRequired: i < 3,
				milestoneId: milestone3.id,
			},
		});
	}

	// ─── Milestones for Project 2 ───
	await prisma.milestone.create({
		data: {
			name: "Site Clearing & Piling",
			description: "Clear site, bore piles, and prepare foundation layout",
			order: 1,
			projectId: project2.id,
		},
	});

	await prisma.milestone.create({
		data: {
			name: "Basement & Ground Floor",
			description: "Underground parking construction and ground floor slab",
			order: 2,
			projectId: project2.id,
		},
	});

	// ─── Payments for Project 1 ───
	await prisma.payment.create({
		data: {
			projectId: project1.id,
			amount: 500000,
			currency: "INR",
			status: "PAID",
			createdById: superAdmin.id,
		},
	});

	await prisma.payment.create({
		data: {
			projectId: project1.id,
			amount: 350000,
			currency: "INR",
			status: "PENDING",
			createdById: superAdmin.id,
		},
	});

	// ─── Queries (Client Issues) ───
	const query1 = await prisma.query.create({
		data: {
			projectId: project1.id,
			authorId: client.id,
			title: "Crack observed in boundary wall",
			description:
				"I noticed a visible crack running vertically along the north-side boundary wall near the main gate. This appeared after last week's heavy rain. Please investigate urgently.",
			priority: QueryPriority.HIGH,
			status: QueryStatus.IN_PROGRESS,
		},
	});

	await prisma.queryResponse.create({
		data: {
			queryId: query1.id,
			authorId: pm.id,
			message: "Thank you for reporting this. Our structural engineer will inspect the wall tomorrow morning. This appears to be a settlement crack which is common during the initial drying period.",
		},
	});

	await prisma.queryResponse.create({
		data: {
			queryId: query1.id,
			authorId: engineer.id,
			message: "Inspected the crack today. It's a minor shrinkage crack in the plaster, not structural. We'll repair it with crack filler and apply waterproof coating. Will be fixed by Friday.",
		},
	});

	await prisma.query.create({
		data: {
			projectId: project1.id,
			authorId: client.id,
			title: "Window size doesn't match approved plan",
			description:
				"The bedroom window on the first floor east side looks smaller than what was in the approved architectural drawing. Can you please verify?",
			priority: QueryPriority.MEDIUM,
			status: QueryStatus.OPEN,
		},
	});

	await prisma.query.create({
		data: {
			projectId: project1.id,
			authorId: client.id,
			title: "Request for extra power outlet in kitchen",
			description: "Can we add 2 more power outlets above the kitchen counter for appliances? Happy to bear any extra cost.",
			priority: QueryPriority.LOW,
			status: QueryStatus.RESOLVED,
		},
	});

	// ─── Project Updates ───
	await prisma.projectUpdate.create({
		data: {
			projectId: project1.id,
			authorId: pm.id,
			notes: "Foundation work completed ahead of schedule. Plinth beam curing in progress. Ground floor column reinforcement work starts next week.",
			statusSnapshot: "IN_PROGRESS",
		},
	});

	await prisma.projectUpdate.create({
		data: {
			projectId: project1.id,
			authorId: engineer.id,
			notes: "Concrete cube test results for foundation received — all samples passed 28-day strength test (M25 grade). Reports attached to project files.",
			statusSnapshot: "IN_PROGRESS",
		},
	});

	console.log("✅ Seed complete!");
	console.log("");
	console.log("🔑 Test Accounts (password: admin123)");
	console.log("─".repeat(50));
	console.log(`  Super Admin : ${superAdmin.email} (${superAdmin.name})`);
	console.log(`  Admin       : ${admin.email} (${admin.name})`);
	console.log(`  PM          : ${pm.email} (${pm.name})`);
	console.log(`  Engineer    : ${engineer.email} (${engineer.name})`);
	console.log(`  Client      : ${client.email} (${client.name})`);
	console.log("");
	console.log("📂 Projects");
	console.log(`  1. ${project1.name} [${project1.status}]`);
	console.log(`  2. ${project2.name} [${project2.status}]`);
	console.log("");
	console.log("📋 Milestones: 5 total (3 for Greenfield, 2 for Sunrise)");
	console.log("✅ Checklists: 15 items across 3 milestones");
	console.log("💬 Queries: 3 issues with threaded responses");
	console.log("💰 Payments: 2 records");
	console.log("📝 Updates: 2 site updates");
}

main()
	.catch((e) => {
		console.error("❌ Seed failed:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

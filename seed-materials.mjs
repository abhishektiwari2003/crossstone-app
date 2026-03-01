import { PrismaClient } from './src/generated/prisma_new/index.js';

const prisma = new PrismaClient();

async function main() {
    const project = await prisma.project.findFirst();
    if (!project) {
        console.log("No projects found, skip seeding.");
        return;
    }

    const user = await prisma.user.findFirst({ where: { role: 'PROJECT_MANAGER' } }) || await prisma.user.findFirst();

    await prisma.material.createMany({
        data: [
            {
                projectId: project.id,
                createdById: user.id,
                name: 'Portland Cement Grade 53',
                quantity: 500,
                unit: 'bags',
                unitCost: 350,
                totalCost: 175000,
                supplier: 'UltraTech Supplies Ltd.',
                status: 'DELIVERED'
            },
            {
                projectId: project.id,
                createdById: user.id,
                name: 'TMT Steel Bars (12mm)',
                quantity: 10,
                unit: 'ton',
                unitCost: 55000,
                totalCost: 550000,
                supplier: 'Tata Steel',
                status: 'ORDERED'
            },
            {
                projectId: project.id,
                createdById: user.id,
                name: 'River Sand',
                quantity: 1000,
                unit: 'cu.m',
                unitCost: 1200,
                totalCost: 1200000,
                supplier: 'Local Quarry',
                status: 'USED'
            }
        ]
    });

    console.log("Seeded 3 materials successfully to Project:", project.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());

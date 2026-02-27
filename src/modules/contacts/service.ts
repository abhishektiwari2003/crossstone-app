import { prisma } from "@/lib/prisma";
import { isAdmin, canViewProject, type AppRole } from "@/lib/authz";

// ─── Contact DTO type ───
interface ContactDTO {
    id: string;
    name: string;
    role: string;
    designation: string | null;
    phone: string | null;
    email: string;
    whatsappLink: string | null;
    callLink: string | null;
    emailLink: string;
}

// ─── Select fields for user contact ───
const contactSelect = {
    id: true,
    name: true,
    email: true,
    phone: true,
    designation: true,
    role: true,
} as const;

// ─── Build contact DTO with computed links ───
function toContactDTO(user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    designation: string | null;
    role: string;
}): ContactDTO {
    const cleanPhone = user.phone?.replace(/[\s+\-()]/g, "") ?? null;
    return {
        id: user.id,
        name: user.name,
        role: user.role,
        designation: user.designation,
        phone: user.phone,
        email: user.email,
        whatsappLink: cleanPhone ? `https://wa.me/${cleanPhone}` : null,
        callLink: user.phone ? `tel:${user.phone}` : null,
        emailLink: `mailto:${user.email}`,
    };
}

// ─── Get project contacts (role-filtered) ───
export async function getProjectContacts(
    projectId: string,
    currentUser: { id: string; role: AppRole }
) {
    // RBAC: verify project access
    const allowed = await canViewProject(currentUser.id, currentUser.role, projectId);
    if (!allowed) {
        return { error: "Forbidden", status: 403 } as const;
    }

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: {
            managerId: true,
            clientId: true,
        },
    });

    if (!project) {
        return { error: "Project not found", status: 404 } as const;
    }

    // Fetch all relevant users
    const [manager, client, engineerMembers] = await Promise.all([
        prisma.user.findUnique({
            where: { id: project.managerId },
            select: contactSelect,
        }),
        prisma.user.findUnique({
            where: { id: project.clientId },
            select: contactSelect,
        }),
        prisma.projectMember.findMany({
            where: { projectId, role: "SITE_ENGINEER" },
            include: { user: { select: contactSelect } },
        }),
    ]);

    const engineers = engineerMembers.map(m => m.user);

    // Apply role-based visibility filtering
    const contacts: ContactDTO[] = [];

    if (isAdmin(currentUser.role)) {
        // Admin/Super Admin sees all
        if (manager) contacts.push(toContactDTO(manager));
        engineers.forEach(e => { if (e) contacts.push(toContactDTO(e)); });
        if (client) contacts.push(toContactDTO(client));
    } else if (currentUser.role === "PROJECT_MANAGER") {
        // PM sees engineers + client
        engineers.forEach(e => { if (e) contacts.push(toContactDTO(e)); });
        if (client) contacts.push(toContactDTO(client));
    } else if (currentUser.role === "SITE_ENGINEER") {
        // Engineer sees PM + other engineers
        if (manager) contacts.push(toContactDTO(manager));
        engineers.forEach(e => { if (e) contacts.push(toContactDTO(e)); });
    } else if (currentUser.role === "CLIENT") {
        // Client sees PM + engineers
        if (manager) contacts.push(toContactDTO(manager));
        engineers.forEach(e => { if (e) contacts.push(toContactDTO(e)); });
    }

    return { contacts, status: 200 } as const;
}

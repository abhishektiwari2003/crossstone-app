import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { AppRole } from "@/lib/authz";

export type SessionUser = {
    id: string;
    name: string | null;
    email: string | null;
    role: AppRole;
};

/**
 * Get the current authenticated user from the session.
 * Role comes from the JWT token (which was set from DB at login time).
 * Throws if not authenticated — use in API routes that require auth.
 */
export async function getCurrentUser(): Promise<SessionUser> {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        throw new AuthError("Unauthorized", 401);
    }

    const user = session.user as { id?: string; role?: string; name?: string | null; email?: string | null };

    if (!user.id || !user.role) {
        throw new AuthError("Invalid session", 401);
    }

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, isActive: true }
    });

    if (!dbUser || !dbUser.isActive) {
        throw new AuthError("Session expired. Please sign out and sign back in.", 401);
    }

    return {
        id: user.id,
        name: user.name ?? null,
        email: user.email ?? null,
        role: user.role as AppRole,
    };
}

/**
 * Custom error class for auth failures.
 * API routes can catch this to return proper HTTP responses.
 */
export class AuthError extends Error {
    public status: number;

    constructor(message: string, status: number = 401) {
        super(message);
        this.name = "AuthError";
        this.status = status;
    }
}

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { Role } from "@/generated/prisma";
import AuditLogClient from "@/components/audit/AuditLogClient";

export default async function AuditLogPage() {
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: Role } | null)?.role || "USER";

    return <AuditLogClient sessionRole={role} />;
}

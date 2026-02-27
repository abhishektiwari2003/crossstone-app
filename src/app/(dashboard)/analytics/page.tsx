import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { Role } from "@/generated/prisma";
import AnalyticsClient from "@/components/analytics/AnalyticsClient";

export default async function AnalyticsDashboardPage() {
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: Role } | null)?.role || "USER";

    return <AnalyticsClient sessionRole={role} />;
}

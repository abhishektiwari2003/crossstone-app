import useSWR from "swr";
import type { AuditLog, ProjectActivity, AuditLogFilters } from "@/types/audit";

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Failed to fetch data");
    }
    return res.json();
};

export function useProjectActivity(projectId: string) {
    const { data, error, isLoading, mutate } = useSWR<ProjectActivity[]>(
        projectId ? `/api/projects/${projectId}/activity` : null,
        fetcher
    );

    return {
        activity: Array.isArray(data) ? data : [],
        isLoading,
        isError: error,
        mutate,
    };
}

export function useAuditLogs(filters: AuditLogFilters = {}) {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    if (filters.projectId) queryParams.append("projectId", filters.projectId);
    if (filters.userId) queryParams.append("userId", filters.userId);
    if (filters.action) queryParams.append("action", filters.action);
    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.limit) queryParams.append("limit", filters.limit.toString());

    const queryString = queryParams.toString();
    const url = `/api/audit-logs${queryString ? `?${queryString}` : ""}`;

    const { data, error, isLoading, mutate } = useSWR<{ items: AuditLog[], nextCursor: string | null }>(
        url,
        fetcher
    );

    return {
        logs: data?.items || [],
        total: data?.items?.length || 0,
        isLoading,
        isError: error,
        mutate,
    };
}

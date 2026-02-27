import useSWR from "swr";
import type { ProjectReportData } from "@/types/reports";

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to fetch report data");
    }
    return res.json();
};

export function useProjectReport(projectId: string) {
    const { data, error, isLoading, mutate } = useSWR<ProjectReportData>(
        projectId ? `/api/projects/${projectId}/report` : null,
        fetcher,
        {
            revalidateOnFocus: false, // Reports change less frequently
        }
    );

    return {
        report: data,
        isLoading,
        isError: error,
        mutate,
    };
}

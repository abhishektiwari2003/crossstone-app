import useSWR from "swr";
import type { AnalyticsData, AnalyticsFilters } from "@/types/analytics";

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || "Failed to fetch analytics data");
    }
    return res.json();
};

export function useAnalytics(filters: AnalyticsFilters = {}) {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    if (filters.from) queryParams.append("from", filters.from);
    if (filters.to) queryParams.append("to", filters.to);

    const queryString = queryParams.toString();
    const url = `/api/analytics${queryString ? `?${queryString}` : ""}`;

    const { data, error, isLoading, mutate } = useSWR<AnalyticsData>(
        url,
        fetcher,
        {
            keepPreviousData: true, // Keep showing old data while refetching on date change
            revalidateOnFocus: false,
        }
    );

    return {
        data,
        isLoading,
        isError: error,
        mutate,
    };
}

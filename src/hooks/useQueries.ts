import useSWR from "swr";
import type { Query } from "@/types/queries";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useQueries(projectId: string) {
    const { data, error, mutate, isLoading } = useSWR<{ items: Query[]; nextCursor: string | null }>(
        `/api/projects/${projectId}/queries`,
        fetcher
    );

    return {
        queries: data?.items || [],
        isLoading,
        isError: !!error,
        mutate,
    };
}

export function useQueryDetail(queryId: string) {
    const { data, error, mutate, isLoading } = useSWR<{ query: Query }>(
        `/api/queries/${queryId}`,
        fetcher
    );

    return {
        query: data?.query,
        isLoading,
        isError: !!error,
        mutate,
    };
}

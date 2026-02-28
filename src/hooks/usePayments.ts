import useSWR from "swr";
import { AdvancedPayment, PaymentSummaryData, PaymentFilters } from "@/types/payments";

const fetcher = (url: string) => fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
});

export function usePayments(projectId: string, filters?: PaymentFilters) {
    const queryParams = new URLSearchParams();

    if (filters) {
        if (filters.status) queryParams.append("status", filters.status);
        if (filters.category) queryParams.append("category", filters.category);
        if (filters.from) queryParams.append("from", filters.from);
        if (filters.to) queryParams.append("to", filters.to);
        if (filters.invoiceNumber) queryParams.append("invoiceNumber", filters.invoiceNumber);
        if (filters.limit) queryParams.append("limit", filters.limit.toString());
        if (filters.cursor) queryParams.append("cursor", filters.cursor);
    }

    const queryString = queryParams.toString();
    const url = `/api/projects/${projectId}/payments${queryString ? `?${queryString}` : ""}`;

    const { data, error, isLoading, mutate } = useSWR<{ items: AdvancedPayment[], nextCursor: string | null }>(
        url,
        fetcher,
        {
            revalidateOnFocus: false,
        }
    );

    return {
        data,
        isLoading,
        isError: !!error,
        mutate,
    };
}

export function usePaymentSummary(projectId: string) {
    const { data, error, isLoading, mutate } = useSWR<PaymentSummaryData>(
        `/api/projects/${projectId}/payments/summary`,
        fetcher,
        {
            revalidateOnFocus: false,
            refreshInterval: 0,
        }
    );

    return {
        summary: data,
        isLoading,
        isError: !!error,
        mutate,
    };
}

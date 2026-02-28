import { PaymentStatus } from "@/generated/prisma";


export type PaymentCategory = "MATERIAL" | "LABOR" | "CONTRACTOR" | "OTHER";

export interface PaymentAsset {
    id: string;
    url: string;
    mimeType: string;
}

export interface AdvancedPayment {
    id: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    category: PaymentCategory | null;
    invoiceNumber: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
    paidAt: string | null;
    assets: PaymentAsset[]; // Assuming receipts are tied here
}

export interface PaymentSummaryData {
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    overdueAmount: number;
}

export interface PaymentFilters {
    status?: PaymentStatus;
    category?: PaymentCategory;
    from?: string; // YYYY-MM-DD
    to?: string;   // YYYY-MM-DD
    invoiceNumber?: string;
    limit?: number;
    cursor?: string;
}

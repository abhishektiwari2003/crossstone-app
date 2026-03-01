import { z } from "zod";

export const MATERIAL_STATUSES = ["ORDERED", "DELIVERED", "USED"] as const;
export type MaterialStatus = typeof MATERIAL_STATUSES[number];

export type Material = {
    id: string;
    projectId: string;
    name: string;
    quantity: number;
    unit: string;
    unitCost: number;
    totalCost: number;
    supplier: string | null;
    status: MaterialStatus;
    createdById: string;
    createdAt: string;
};

export type MaterialSummary = {
    totalItems: number;
    totalCost: number;
    statusBreakdown: {
        status: MaterialStatus;
        count: number;
        totalCost: number;
    }[];
};

export const MaterialSchema = z.object({
    name: z.string().min(1, "Name is required"),
    quantity: z.number().min(0.01, "Quantity must be greater than 0"),
    unit: z.string().min(1, "Unit is required"),
    unitCost: z.number().min(0, "Unit cost must be positive"),
    supplier: z.string().nullable().optional(),
    status: z.enum(MATERIAL_STATUSES),
});

export type MaterialFormValues = z.infer<typeof MaterialSchema>;

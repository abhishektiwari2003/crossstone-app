import { z } from "zod";

export const CreateMaterialSchema = z.object({
    name: z.string().min(1, "Material name is required"),
    quantity: z.number().min(0, "Quantity must be >= 0"),
    unit: z.string().min(1, "Unit is required"),
    unitCost: z.number().min(0, "Unit cost must be >= 0"),
    supplier: z.string().optional(),
    status: z.enum(["ORDERED", "DELIVERED", "USED"]).optional().default("ORDERED"),
});

export const UpdateMaterialSchema = z.object({
    quantity: z.number().min(0, "Quantity must be >= 0").optional(),
    unitCost: z.number().min(0, "Unit cost must be >= 0").optional(),
    supplier: z.string().optional(),
    status: z.enum(["ORDERED", "DELIVERED", "USED"]).optional(),
});

export type CreateMaterialInput = z.infer<typeof CreateMaterialSchema>;
export type UpdateMaterialInput = z.infer<typeof UpdateMaterialSchema>;

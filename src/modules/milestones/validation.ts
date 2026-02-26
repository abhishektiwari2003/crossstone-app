import { z } from "zod";

export const CreateMilestoneSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    order: z.number().int().min(0),
});

export const UpdateMilestoneSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    order: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
});

export const CreateChecklistSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    order: z.number().int().min(0),
    isRequired: z.boolean().optional().default(true),
    isPhotoRequired: z.boolean().optional().default(false),
});

export const UpdateChecklistSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    order: z.number().int().min(0).optional(),
    isRequired: z.boolean().optional(),
    isPhotoRequired: z.boolean().optional(),
});

export type CreateMilestoneInput = z.infer<typeof CreateMilestoneSchema>;
export type UpdateMilestoneInput = z.infer<typeof UpdateMilestoneSchema>;
export type CreateChecklistInput = z.infer<typeof CreateChecklistSchema>;
export type UpdateChecklistInput = z.infer<typeof UpdateChecklistSchema>;

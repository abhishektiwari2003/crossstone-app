import { z } from "zod";

export const CreateQuerySchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional().default("MEDIUM"),
    attachmentIds: z.array(z.string()).optional().default([]),
});

export const UpdateQuerySchema = z.object({
    status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
});

export const CreateQueryResponseSchema = z.object({
    message: z.string().min(1, "Message is required"),
});

export type CreateQueryInput = z.infer<typeof CreateQuerySchema>;
export type UpdateQueryInput = z.infer<typeof UpdateQuerySchema>;
export type CreateQueryResponseInput = z.infer<typeof CreateQueryResponseSchema>;

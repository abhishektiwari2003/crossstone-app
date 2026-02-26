import { z } from "zod";

const ResponseSchema = z.object({
    checklistItemId: z.string().min(1),
    result: z.enum(["PASS", "FAIL", "NA"]),
    remark: z.string().optional(),
    mediaId: z.string().optional(),
});

export const CreateInspectionSchema = z.object({
    projectId: z.string().min(1),
    milestoneId: z.string().min(1),
    status: z.enum(["DRAFT", "SUBMITTED"]).optional().default("DRAFT"),
    responses: z.array(ResponseSchema).min(1, "At least one response is required"),
});

export const ReviewInspectionSchema = z.object({
    status: z.literal("REVIEWED"),
});

export type CreateInspectionInput = z.infer<typeof CreateInspectionSchema>;
export type ReviewInspectionInput = z.infer<typeof ReviewInspectionSchema>;

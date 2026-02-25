import { z } from "zod";

export const AddMemberSchema = z.object({
    userId: z.string().min(1, "userId is required"),
    role: z.enum(["SITE_ENGINEER", "PROJECT_MANAGER"]),
});

export const RemoveMemberSchema = z.object({
    memberId: z.string().min(1, "memberId is required"),
});

export type AddMemberInput = z.infer<typeof AddMemberSchema>;
export type RemoveMemberInput = z.infer<typeof RemoveMemberSchema>;

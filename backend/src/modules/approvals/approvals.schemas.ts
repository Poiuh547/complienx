import { z } from "zod";

export const decideApprovalSchema = z.object({
  comment: z.string().max(2000).optional()
});

export type DecideApprovalInput = z.infer<typeof decideApprovalSchema>;

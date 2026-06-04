import { z } from "zod";

export const createActionSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(3000).optional(),
  rootCause: z.string().max(3000).optional(),
  actionPlan: z.string().max(3000).optional(),
  closureResult: z.string().max(3000).optional(),
  closureEvidence: z.string().max(3000).optional(),
  verificationComment: z.string().max(3000).optional(),
  type: z.enum(["corrective", "preventive", "improvement"]),
  priority: z.enum(["low", "medium", "high", "critical"]).optional().default("medium"),
  dueDate: z.string().date().optional()
});

export const updateActionSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(3000).nullable().optional(),
  rootCause: z.string().max(3000).nullable().optional(),
  actionPlan: z.string().max(3000).nullable().optional(),
  closureResult: z.string().max(3000).nullable().optional(),
  closureEvidence: z.string().max(3000).nullable().optional(),
  verificationComment: z.string().max(3000).nullable().optional(),
  type: z.enum(["corrective", "preventive", "improvement"]).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  status: z.enum(["open", "in_progress", "in_review", "closed", "cancelled"]).optional(),
  dueDate: z.string().date().nullable().optional()
});

export const createActionCommentSchema = z.object({
  comment: z.string().min(1).max(2000)
});

export type CreateActionInput = z.infer<typeof createActionSchema>;
export type UpdateActionInput = z.infer<typeof updateActionSchema>;
export type CreateActionCommentInput = z.infer<typeof createActionCommentSchema>;

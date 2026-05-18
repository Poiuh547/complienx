import { z } from "zod";

export const createDocumentSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  categoryId: z.string().optional(),
  reviewDueDate: z.string().date().optional()
});

export const updateDocumentSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  categoryId: z.string().nullable().optional(),
  status: z.enum(["draft", "in_review", "approved", "rejected", "expired", "archived"]).optional(),
  reviewDueDate: z.string().date().nullable().optional()
});

export const createCategorySchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(1000).optional()
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

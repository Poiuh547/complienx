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

export const createDocumentVersionSchema = z.object({
  versionNumber: z.string().min(1).max(30),
  fileUrl: z.string().min(1).max(2000),
  fileName: z.string().min(1).max(255),
  fileType: z.string().max(120).optional(),
  changeNotes: z.string().max(2000).optional(),
  setAsCurrent: z.boolean().optional().default(true)
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CreateDocumentVersionInput = z.infer<typeof createDocumentVersionSchema>;

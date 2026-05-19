import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2).max(150),
  email: z.string().email().max(180),
  password: z.string().min(8).max(120),
  role: z.enum(["admin", "collaborator", "auditor"]).optional().default("collaborator")
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  role: z.enum(["admin", "collaborator", "auditor"]).optional(),
  status: z.enum(["active", "inactive"]).optional()
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

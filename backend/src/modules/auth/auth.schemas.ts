import { z } from "zod";

export const registerSchema = z.object({
  companyName: z.string().min(2).max(180),
  legalName: z.string().max(220).optional(),
  taxId: z.string().max(80).optional(),
  name: z.string().min(2).max(150),
  email: z.string().email().max(180),
  password: z.string().min(8).max(100)
});

export const loginSchema = z.object({
  email: z.string().email().max(180),
  password: z.string().min(1).max(100),
  companyId: z.string().optional()
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().max(180)
});

export const resetPasswordSchema = z.object({
  token: z.string().min(20),
  password: z.string().min(8).max(100)
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

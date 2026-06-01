import { z } from 'zod';

export const registerCompanySchema = z.object({
  companyName: z.string().min(2).max(180),
  legalName: z.string().max(220).optional(),
  taxId: z.string().max(80).optional(),
  userName: z.string().min(2).max(150),
  email: z.string().email().max(180),
  password: z.string().min(8).max(120),
});

export const loginSchema = z.object({
  email: z.string().email().max(180),
  password: z.string().min(1),
  companyId: z.string().optional(),
});

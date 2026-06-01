import jwt from 'jsonwebtoken';
import { CompanyRole } from '@prisma/client';
import { env } from '../config/env';

export type SessionPayload = {
  userId: string;
  companyId?: string;
  role?: CompanyRole;
  isPlatformAdmin: boolean;
};

export function signSessionToken(payload: SessionPayload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

export function verifySessionToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as SessionPayload;
}

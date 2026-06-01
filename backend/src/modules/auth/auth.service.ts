import { prisma } from '../../lib/prisma';
import { comparePassword, hashPassword } from '../../lib/password';
import { signSessionToken } from '../../lib/token';
import { createHttpError } from '../../http/errors';
import { loginSchema, registerCompanySchema } from './auth.schemas';

export async function registerCompany(input: unknown) {
  const data = registerCompanySchema.parse(input);
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });

  if (existingUser) {
    throw createHttpError(409, 'Email is already registered');
  }

  const passwordHash = await hashPassword(data.password);

  const result = await prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: {
        name: data.companyName,
        legalName: data.legalName,
        taxId: data.taxId,
      },
    });

    const user = await tx.user.create({
      data: {
        name: data.userName,
        email: data.email,
        passwordHash,
      },
    });

    const membership = await tx.companyUser.create({
      data: {
        companyId: company.id,
        userId: user.id,
        role: 'company_admin',
      },
    });

    return { company, user, membership };
  });

  const token = signSessionToken({
    userId: result.user.id.toString(),
    companyId: result.company.id.toString(),
    role: result.membership.role,
    isPlatformAdmin: result.user.isPlatformAdmin,
  });

  return {
    token,
    user: {
      id: result.user.id.toString(),
      name: result.user.name,
      email: result.user.email,
      isPlatformAdmin: result.user.isPlatformAdmin,
    },
    company: {
      id: result.company.id.toString(),
      name: result.company.name,
      role: result.membership.role,
    },
  };
}

export async function login(input: unknown) {
  const data = loginSchema.parse(input);
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    include: { companies: { include: { company: true } } },
  });

  if (!user || user.status !== 'active') {
    throw createHttpError(401, 'Invalid credentials');
  }

  const isPasswordValid = await comparePassword(data.password, user.passwordHash);

  if (!isPasswordValid) {
    throw createHttpError(401, 'Invalid credentials');
  }

  const activeMemberships = user.companies.filter((membership) => {
    return membership.status === 'active' && membership.company.status === 'active';
  });

  const selectedMembership = data.companyId
    ? activeMemberships.find((membership) => membership.companyId.toString() === data.companyId)
    : activeMemberships[0];

  if (!selectedMembership && !user.isPlatformAdmin) {
    throw createHttpError(403, 'User does not belong to an active company');
  }

  const token = signSessionToken({
    userId: user.id.toString(),
    companyId: selectedMembership?.companyId.toString(),
    role: selectedMembership?.role,
    isPlatformAdmin: user.isPlatformAdmin,
  });

  return {
    token,
    user: {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      isPlatformAdmin: user.isPlatformAdmin,
    },
    companies: activeMemberships.map((membership) => ({
      id: membership.company.id.toString(),
      name: membership.company.name,
      role: membership.role,
    })),
  };
}

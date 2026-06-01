import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { prisma } from "../../config/prisma";
import { HttpError } from "../../utils/http-error";
import type { LoginInput, RegisterInput } from "./auth.schemas";

const createToken = (input: {
  userId: string;
  role: string;
  companyId?: string;
  isPlatformAdmin?: boolean;
}) => {
  return jwt.sign(
    {
      sub: input.userId,
      role: input.role,
      companyId: input.companyId,
      isPlatformAdmin: input.isPlatformAdmin ?? false
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
};

const publicUserFields = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  isPlatformAdmin: true,
  createdAt: true,
  updatedAt: true
};

const toPublicUser = (user: {
  id: bigint;
  name: string;
  email: string;
  role: string;
  status: string;
  isPlatformAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: user.id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  isPlatformAdmin: user.isPlatformAdmin,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

const toPublicCompany = (membership: {
  role: string;
  company: {
    id: bigint;
    name: string;
    status: string;
  };
}) => ({
  id: membership.company.id.toString(),
  name: membership.company.name,
  status: membership.company.status,
  role: membership.role
});

export const registerUser = async (input: RegisterInput) => {
  const email = input.email.toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new HttpError(409, "Email already registered");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const result = await prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: {
        name: input.companyName,
        legalName: input.legalName,
        taxId: input.taxId
      }
    });

    const user = await tx.user.create({
      data: {
        name: input.name,
        email,
        passwordHash,
        role: "admin"
      },
      select: publicUserFields
    });

    const membership = await tx.companyUser.create({
      data: {
        companyId: company.id,
        userId: user.id,
        role: "company_admin"
      },
      include: { company: true }
    });

    return { user, membership };
  });

  const company = toPublicCompany(result.membership);
  const token = createToken({
    userId: result.user.id.toString(),
    role: result.user.role,
    companyId: company.id,
    isPlatformAdmin: result.user.isPlatformAdmin
  });

  return { user: toPublicUser(result.user), company, companies: [company], token };
};

export const loginUser = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
    include: {
      companies: {
        include: { company: true },
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!user) {
    throw new HttpError(401, "Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordMatches) {
    throw new HttpError(401, "Invalid email or password");
  }

  if (user.status !== "active") {
    throw new HttpError(403, "User is inactive");
  }

  const activeMemberships = user.companies.filter((membership) => {
    return membership.status === "active" && membership.company.status === "active";
  });

  const selectedMembership = input.companyId
    ? activeMemberships.find((membership) => membership.companyId.toString() === input.companyId)
    : activeMemberships[0];

  if (!selectedMembership && !user.isPlatformAdmin) {
    throw new HttpError(403, "User does not belong to an active company");
  }

  const company = selectedMembership ? toPublicCompany(selectedMembership) : null;
  const token = createToken({
    userId: user.id.toString(),
    role: user.role,
    companyId: company?.id,
    isPlatformAdmin: user.isPlatformAdmin
  });

  return {
    user: toPublicUser(user),
    company,
    companies: activeMemberships.map(toPublicCompany),
    token
  };
};

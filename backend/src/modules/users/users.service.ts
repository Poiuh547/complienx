import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma";
import { HttpError } from "../../utils/http-error";
import type { CreateUserInput, UpdateUserInput } from "./users.schemas";

const publicUserFields = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true
};

const toPublicUser = (user: {
  id: bigint;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: user.id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: BigInt(userId) },
    select: publicUserFields
  });

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  return toPublicUser(user);
};

export const listUsers = async () => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: publicUserFields
  });

  return users.map(toPublicUser);
};

export const createUser = async (input: CreateUserInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() }
  });

  if (existingUser) {
    throw new HttpError(409, "Email already registered");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash,
      role: input.role
    },
    select: publicUserFields
  });

  return toPublicUser(user);
};

export const updateUser = async (id: string, input: UpdateUserInput) => {
  await getCurrentUser(id);

  const user = await prisma.user.update({
    where: { id: BigInt(id) },
    data: {
      name: input.name,
      role: input.role,
      status: input.status
    },
    select: publicUserFields
  });

  return toPublicUser(user);
};

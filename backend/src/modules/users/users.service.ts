import { prisma } from "../../config/prisma";
import { HttpError } from "../../utils/http-error";

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: BigInt(userId) },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  return {
    id: user.id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

import { prisma } from "../../config/prisma";
import { HttpError } from "../../utils/http-error";
import type { CreateActionCommentInput, CreateActionInput, UpdateActionInput } from "./actions.schemas";

const ownerSelect = {
  id: true,
  name: true,
  email: true
};

const toPublicActionComment = (comment: any) => ({
  ...comment,
  id: comment.id.toString(),
  actionId: comment.actionId.toString(),
  userId: comment.userId.toString(),
  user: comment.user
    ? {
        id: comment.user.id.toString(),
        name: comment.user.name,
        email: comment.user.email
      }
    : null
});

const toPublicAction = (action: any) => ({
  ...action,
  id: action.id.toString(),
  companyId: action.companyId?.toString(),
  ownerId: action.ownerId?.toString() ?? null,
  owner: action.owner
    ? {
        id: action.owner.id.toString(),
        name: action.owner.name,
        email: action.owner.email
      }
    : null,
  comments: action.comments ? action.comments.map(toPublicActionComment) : undefined
});

export const listActions = async (companyId: string) => {
  const actions = await prisma.action.findMany({
    where: { companyId: BigInt(companyId) },
    orderBy: { createdAt: "desc" },
    include: {
      owner: {
        select: ownerSelect
      }
    }
  });

  return actions.map(toPublicAction);
};

export const getActionById = async (id: string, companyId: string) => {
  const action = await prisma.action.findFirst({
    where: {
      id: BigInt(id),
      companyId: BigInt(companyId)
    },
    include: {
      owner: {
        select: ownerSelect
      },
      comments: {
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: ownerSelect
          }
        }
      }
    }
  });

  if (!action) {
    throw new HttpError(404, "Action not found");
  }

  return toPublicAction(action);
};

export const createAction = async (input: CreateActionInput, ownerId: string, companyId: string) => {
  const action = await prisma.action.create({
    data: {
      companyId: BigInt(companyId),
      title: input.title,
      description: input.description,
      rootCause: input.rootCause,
      actionPlan: input.actionPlan,
      closureResult: input.closureResult,
      closureEvidence: input.closureEvidence,
      verificationComment: input.verificationComment,
      type: input.type,
      priority: input.priority,
      ownerId: BigInt(ownerId),
      dueDate: input.dueDate ? new Date(input.dueDate) : null
    },
    include: {
      owner: {
        select: ownerSelect
      }
    }
  });

  return toPublicAction(action);
};

export const updateAction = async (id: string, companyId: string, input: UpdateActionInput) => {
  await getActionById(id, companyId);

  const action = await prisma.action.update({
    where: { id: BigInt(id) },
    data: {
      title: input.title,
      description: input.description,
      rootCause: input.rootCause,
      actionPlan: input.actionPlan,
      closureResult: input.closureResult,
      closureEvidence: input.closureEvidence,
      verificationComment: input.verificationComment,
      type: input.type,
      priority: input.priority,
      status: input.status,
      dueDate:
        input.dueDate === undefined
          ? undefined
          : input.dueDate
            ? new Date(input.dueDate)
            : null,
      closedAt: input.status === "closed" ? new Date() : undefined
    },
    include: {
      owner: {
        select: ownerSelect
      }
    }
  });

  return toPublicAction(action);
};

export const createActionComment = async (
  actionId: string,
  companyId: string,
  userId: string,
  input: CreateActionCommentInput
) => {
  await getActionById(actionId, companyId);

  const comment = await prisma.actionComment.create({
    data: {
      actionId: BigInt(actionId),
      userId: BigInt(userId),
      comment: input.comment
    },
    include: {
      user: {
        select: ownerSelect
      }
    }
  });

  return toPublicActionComment(comment);
};

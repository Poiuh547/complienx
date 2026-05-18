import { prisma } from "../../config/prisma";
import { HttpError } from "../../utils/http-error";
import type { CreateActionCommentInput, CreateActionInput, UpdateActionInput } from "./actions.schemas";

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

export const listActions = async () => {
  const actions = await prisma.action.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  return actions.map(toPublicAction);
};

export const getActionById = async (id: string) => {
  const action = await prisma.action.findUnique({
    where: { id: BigInt(id) },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      comments: {
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
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

export const createAction = async (input: CreateActionInput, ownerId: string) => {
  const action = await prisma.action.create({
    data: {
      title: input.title,
      description: input.description,
      type: input.type,
      priority: input.priority,
      ownerId: BigInt(ownerId),
      dueDate: input.dueDate ? new Date(input.dueDate) : null
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  return toPublicAction(action);
};

export const updateAction = async (id: string, input: UpdateActionInput) => {
  await getActionById(id);

  const action = await prisma.action.update({
    where: { id: BigInt(id) },
    data: {
      title: input.title,
      description: input.description,
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
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  return toPublicAction(action);
};

export const createActionComment = async (
  actionId: string,
  userId: string,
  input: CreateActionCommentInput
) => {
  await getActionById(actionId);

  const comment = await prisma.actionComment.create({
    data: {
      actionId: BigInt(actionId),
      userId: BigInt(userId),
      comment: input.comment
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  return toPublicActionComment(comment);
};

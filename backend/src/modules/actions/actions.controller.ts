import type { RequestHandler } from "express";
import { HttpError } from "../../utils/http-error";
import {
  createActionCommentSchema,
  createActionSchema,
  updateActionSchema
} from "./actions.schemas";
import {
  createAction,
  createActionComment,
  getActionById,
  listActions,
  updateAction
} from "./actions.service";

export const getActions: RequestHandler = async (_req, res, next) => {
  try {
    const actions = await listActions();
    res.json({ actions });
  } catch (error) {
    next(error);
  }
};

export const getAction: RequestHandler = async (req, res, next) => {
  try {
    const action = await getActionById(req.params.id);
    res.json({ action });
  } catch (error) {
    next(error);
  }
};

export const postAction: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new HttpError(401, "Unauthorized");
    }

    const input = createActionSchema.parse(req.body);
    const action = await createAction(input, req.user.id);

    res.status(201).json({ action });
  } catch (error) {
    next(error);
  }
};

export const patchAction: RequestHandler = async (req, res, next) => {
  try {
    const input = updateActionSchema.parse(req.body);
    const action = await updateAction(req.params.id, input);

    res.json({ action });
  } catch (error) {
    next(error);
  }
};

export const postActionComment: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new HttpError(401, "Unauthorized");
    }

    const input = createActionCommentSchema.parse(req.body);
    const comment = await createActionComment(req.params.id, req.user.id, input);

    res.status(201).json({ comment });
  } catch (error) {
    next(error);
  }
};

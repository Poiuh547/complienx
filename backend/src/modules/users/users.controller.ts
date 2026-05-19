import type { RequestHandler } from "express";
import { HttpError } from "../../utils/http-error";
import { createUserSchema, updateUserSchema } from "./users.schemas";
import { createUser, getCurrentUser, listUsers, updateUser } from "./users.service";

export const me: RequestHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new HttpError(401, "Unauthorized");
    }

    const user = await getCurrentUser(req.user.id);

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const getUsers: RequestHandler = async (_req, res, next) => {
  try {
    const users = await listUsers();
    res.json({ users });
  } catch (error) {
    next(error);
  }
};

export const postUser: RequestHandler = async (req, res, next) => {
  try {
    const input = createUserSchema.parse(req.body);
    const user = await createUser(input);
    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
};

export const patchUser: RequestHandler = async (req, res, next) => {
  try {
    const input = updateUserSchema.parse(req.body);
    const user = await updateUser(req.params.id, input);
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

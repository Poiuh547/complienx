import type { RequestHandler } from "express";
import { HttpError } from "../../utils/http-error";
import { getCurrentUser } from "./users.service";

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

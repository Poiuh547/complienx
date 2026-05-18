import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { HttpError } from "../utils/http-error";

type JwtPayload = {
  sub: string;
  role: string;
};

export const requireAuth: RequestHandler = (req, _res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader?.startsWith("Bearer ")) {
      throw new HttpError(401, "Missing authorization token");
    }

    const token = authorizationHeader.replace("Bearer ", "");
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    req.user = {
      id: payload.sub,
      role: payload.role
    };

    next();
  } catch (error) {
    next(new HttpError(401, "Invalid or expired token"));
  }
};

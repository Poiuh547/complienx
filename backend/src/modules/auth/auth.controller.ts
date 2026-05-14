import type { RequestHandler } from "express";
import { loginSchema, registerSchema } from "./auth.schemas";
import { loginUser, registerUser } from "./auth.service";

export const register: RequestHandler = async (req, res, next) => {
  try {
    const input = registerSchema.parse(req.body);
    const result = await registerUser(input);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const result = await loginUser(input);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

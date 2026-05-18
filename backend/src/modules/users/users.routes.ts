import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { me } from "./users.controller";

export const usersRouter = Router();

usersRouter.get("/me", requireAuth, me);

usersRouter.get("/", (_req, res) => {
  res.status(501).json({ message: "List users endpoint pending implementation" });
});

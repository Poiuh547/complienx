import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import {
  getAction,
  getActions,
  patchAction,
  postAction,
  postActionComment
} from "./actions.controller";

export const actionsRouter = Router();

actionsRouter.use(requireAuth);

actionsRouter.get("/", getActions);
actionsRouter.post("/", postAction);
actionsRouter.get("/:id", getAction);
actionsRouter.patch("/:id", patchAction);
actionsRouter.post("/:id/comments", postActionComment);

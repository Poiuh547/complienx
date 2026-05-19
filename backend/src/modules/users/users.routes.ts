import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { getUsers, me, patchUser, postUser } from "./users.controller";

export const usersRouter = Router();

usersRouter.use(requireAuth);

usersRouter.get("/me", me);
usersRouter.get("/", getUsers);
usersRouter.post("/", postUser);
usersRouter.patch("/:id", patchUser);

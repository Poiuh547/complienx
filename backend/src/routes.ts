import { Router } from "express";
import { authRouter } from "./modules/auth/auth.routes";
import { usersRouter } from "./modules/users/users.routes";
import { documentsRouter } from "./modules/documents/documents.routes";
import { approvalsRouter } from "./modules/approvals/approvals.routes";
import { actionsRouter } from "./modules/actions/actions.routes";
import { tasksRouter } from "./modules/tasks/tasks.routes";

export const routes = Router();

routes.use("/auth", authRouter);
routes.use("/users", usersRouter);
routes.use("/documents", documentsRouter);
routes.use("/approvals", approvalsRouter);
routes.use("/actions", actionsRouter);
routes.use("/tasks", tasksRouter);

import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { getDashboardTasks } from "./tasks.controller";

export const tasksRouter = Router();

tasksRouter.use(requireAuth);

tasksRouter.get("/dashboard", getDashboardTasks);
tasksRouter.get("/", getDashboardTasks);

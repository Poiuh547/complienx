import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { getSummary } from "./dashboard.controller";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

dashboardRouter.get("/summary", getSummary);

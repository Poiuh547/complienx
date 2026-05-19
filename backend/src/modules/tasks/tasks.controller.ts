import type { RequestHandler } from "express";
import { listDashboardTasks } from "./tasks.service";

export const getDashboardTasks: RequestHandler = async (_req, res, next) => {
  try {
    const tasks = await listDashboardTasks();

    res.json({ tasks });
  } catch (error) {
    next(error);
  }
};

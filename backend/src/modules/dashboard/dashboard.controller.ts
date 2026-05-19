import type { RequestHandler } from "express";
import { getDashboardSummary } from "./dashboard.service";

export const getSummary: RequestHandler = async (_req, res, next) => {
  try {
    const summary = await getDashboardSummary();
    res.json({ summary });
  } catch (error) {
    next(error);
  }
};

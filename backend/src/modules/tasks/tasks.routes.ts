import { Router } from "express";

export const tasksRouter = Router();

tasksRouter.get("/", (_req, res) => {
  res.status(501).json({ message: "List tasks endpoint pending implementation" });
});

tasksRouter.patch("/:id/complete", (_req, res) => {
  res.status(501).json({ message: "Complete task endpoint pending implementation" });
});

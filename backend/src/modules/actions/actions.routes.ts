import { Router } from "express";

export const actionsRouter = Router();

actionsRouter.get("/", (_req, res) => {
  res.status(501).json({ message: "List actions endpoint pending implementation" });
});

actionsRouter.post("/", (_req, res) => {
  res.status(501).json({ message: "Create action endpoint pending implementation" });
});

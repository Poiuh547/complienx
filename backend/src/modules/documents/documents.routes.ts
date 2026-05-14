import { Router } from "express";

export const documentsRouter = Router();

documentsRouter.get("/", (_req, res) => {
  res.status(501).json({ message: "List documents endpoint pending implementation" });
});

documentsRouter.post("/", (_req, res) => {
  res.status(501).json({ message: "Create document endpoint pending implementation" });
});

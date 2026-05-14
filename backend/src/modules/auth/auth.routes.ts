import { Router } from "express";

export const authRouter = Router();

authRouter.post("/login", (_req, res) => {
  res.status(501).json({ message: "Login endpoint pending implementation" });
});

authRouter.post("/register", (_req, res) => {
  res.status(501).json({ message: "Register endpoint pending implementation" });
});

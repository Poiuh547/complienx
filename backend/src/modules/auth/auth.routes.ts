import { Router } from "express";
import { forgotPassword, login, register, resetPasswordController } from "./auth.controller";

export const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPasswordController);

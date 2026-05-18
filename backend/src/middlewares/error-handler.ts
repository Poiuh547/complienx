import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        message: "Validation error",
        statusCode: 400,
        issues: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message
        }))
      }
    });
    return;
  }

  const statusCode = typeof error?.statusCode === "number" ? error.statusCode : 500;
  const message = typeof error?.message === "string" ? error.message : "Internal server error";

  if (statusCode >= 500) {
    console.error(message);
  }

  res.status(statusCode).json({
    error: {
      message,
      statusCode
    }
  });
};

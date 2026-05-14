import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error(error);

  const statusCode = typeof error.statusCode === "number" ? error.statusCode : 500;
  const message = error.message || "Internal server error";

  res.status(statusCode).json({
    error: {
      message,
      statusCode
    }
  });
};

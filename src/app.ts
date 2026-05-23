import express from "express";
import { StatusCodes } from "http-status-codes";

import { sendError, sendSuccess } from "./utils/response.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { issuesRouter } from "./modules/issues/issues.routes.js";
import { metricsRouter } from "./modules/metrics/metrics.routes.js";
import { errorHandler } from "./middleware/error.js";

export const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  return sendSuccess(res, StatusCodes.OK, "DevPulse API running");
});

app.use("/api/auth", authRouter);
app.use("/api/issues", issuesRouter);
app.use("/api/metrics", metricsRouter);

app.use((_req, res) => {
  return sendError(res, StatusCodes.NOT_FOUND, "Route not found");
});

app.use(errorHandler);

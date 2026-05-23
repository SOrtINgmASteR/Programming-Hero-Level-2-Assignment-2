import { Router } from "express";

import { authenticate, requireRole } from "../../middleware/auth.js";
import { getMetricsHandler } from "./metrics.controller.js";

export const metricsRouter = Router();

metricsRouter.get("/", authenticate, requireRole("maintainer"), getMetricsHandler);

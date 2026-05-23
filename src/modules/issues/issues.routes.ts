import { Router } from "express";

import { authenticate } from "../../middleware/auth.js";
import {
  createIssueHandler,
  deleteIssueHandler,
  getAllIssuesHandler,
  getSingleIssueHandler,
  updateIssueHandler
} from "./issues.controller.js";
import { requireRole } from "../../middleware/auth.js";

export const issuesRouter = Router();

issuesRouter.post("/", authenticate, createIssueHandler);
issuesRouter.get("/", getAllIssuesHandler);
issuesRouter.get("/:id", getSingleIssueHandler);
issuesRouter.patch("/:id", authenticate, updateIssueHandler);
issuesRouter.delete("/:id", authenticate, requireRole("maintainer"), deleteIssueHandler);

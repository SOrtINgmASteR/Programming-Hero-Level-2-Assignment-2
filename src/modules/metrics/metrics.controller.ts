import { StatusCodes } from "http-status-codes";

import { countIssues, countIssuesByStatus } from "../../db/queries/issues.js";
import { countUsers } from "../../db/queries/users.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";

export const getMetricsHandler = asyncHandler(async (_req, res) => {
  const [users, issues, open, inProgress, resolved] = await Promise.all([
    countUsers(),
    countIssues(),
    countIssuesByStatus("open"),
    countIssuesByStatus("in_progress"),
    countIssuesByStatus("resolved")
  ]);

  return sendSuccess(res, StatusCodes.OK, "Metrics fetched", {
    users,
    issues,
    byStatus: {
      open,
      in_progress: inProgress,
      resolved
    }
  });
});

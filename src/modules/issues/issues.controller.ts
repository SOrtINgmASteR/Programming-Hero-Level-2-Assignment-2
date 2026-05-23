import { StatusCodes } from "http-status-codes";

import {
  createIssue,
  deleteIssue,
  getIssueById,
  listIssues,
  updateIssue
} from "../../db/queries/issues.js";
import { getUsersByIds } from "../../db/queries/users.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { HttpError } from "../../utils/httpError.js";
import { sendSuccess } from "../../utils/response.js";
import type { IssueStatus, IssueType, Role } from "../../types/common.js";

const allowedTypes: IssueType[] = ["bug", "feature_request"];
const allowedStatus: IssueStatus[] = ["open", "in_progress", "resolved"];

const parseIssueId = (raw: string) => {
  const id = Number.parseInt(raw, 10);
  if (Number.isNaN(id)) {
    throw new HttpError(StatusCodes.BAD_REQUEST, "Invalid issue id");
  }
  return id;
};

export const createIssueHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new HttpError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  }

  const { title, description, type, status } = req.body as {
    title?: string;
    description?: string;
    type?: IssueType;
    status?: IssueStatus;
  };

  if (!title || !description || !type) {
    throw new HttpError(
      StatusCodes.BAD_REQUEST,
      "Title, description, and type are required"
    );
  }

  if (title.length > 150) {
    throw new HttpError(StatusCodes.BAD_REQUEST, "Title too long");
  }

  if (description.length < 20) {
    throw new HttpError(
      StatusCodes.BAD_REQUEST,
      "Description must be at least 20 characters"
    );
  }

  if (!allowedTypes.includes(type)) {
    throw new HttpError(StatusCodes.BAD_REQUEST, "Invalid issue type");
  }

  const issue = await createIssue(title, description, type, req.user.id);

  return sendSuccess(res, StatusCodes.CREATED, "Issue created successfully", issue);
});

export const getAllIssuesHandler = asyncHandler(async (req, res) => {
  const { sort, type, status } = req.query as {
    sort?: "newest" | "oldest";
    type?: IssueType;
    status?: IssueStatus;
  };

  if (type && !allowedTypes.includes(type)) {
    throw new HttpError(StatusCodes.BAD_REQUEST, "Invalid issue type filter");
  }

  if (status && !allowedStatus.includes(status)) {
    throw new HttpError(StatusCodes.BAD_REQUEST, "Invalid issue status filter");
  }

  if (sort && sort !== "newest" && sort !== "oldest") {
    throw new HttpError(StatusCodes.BAD_REQUEST, "Invalid sort value");
  }

  const issues = await listIssues({ sort, type, status });
  const reporterIds = Array.from(new Set(issues.map((issue) => issue.reporter_id)));
  const reporters = reporterIds.length ? await getUsersByIds(reporterIds) : [];
  const reporterMap = new Map(reporters.map((reporter) => [reporter.id, reporter]));

  const data = issues.map((issue) => {
    const reporter = reporterMap.get(issue.reporter_id) ?? null;
    return {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter,
      created_at: issue.created_at,
      updated_at: issue.updated_at
    };
  });

  return sendSuccess(res, StatusCodes.OK, undefined, data);
});

export const getSingleIssueHandler = asyncHandler(async (req, res) => {
  const id = parseIssueId(req.params.id);
  const issue = await getIssueById(id);

  if (!issue) {
    throw new HttpError(StatusCodes.NOT_FOUND, "Issue not found");
  }

  const reporters = await getUsersByIds([issue.reporter_id]);
  const reporter = reporters[0] ?? null;

  return sendSuccess(res, StatusCodes.OK, undefined, {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter,
    created_at: issue.created_at,
    updated_at: issue.updated_at
  });
});

export const updateIssueHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new HttpError(StatusCodes.UNAUTHORIZED, "Unauthorized");
  }

  const id = parseIssueId(req.params.id);
  const existing = await getIssueById(id);

  if (!existing) {
    throw new HttpError(StatusCodes.NOT_FOUND, "Issue not found");
  }

  const role: Role = req.user.role;
  if (role === "contributor") {
    if (existing.reporter_id !== req.user.id) {
      throw new HttpError(StatusCodes.FORBIDDEN, "Forbidden");
    }
    if (existing.status !== "open") {
      throw new HttpError(
        StatusCodes.FORBIDDEN,
        "Contributors can only update open issues"
      );
    }
  }

  const { title, description, type } = req.body as {
    title?: string;
    description?: string;
    type?: IssueType;
  };

  if (title && title.length > 150) {
    throw new HttpError(StatusCodes.BAD_REQUEST, "Title too long");
  }

  if (description && description.length < 20) {
    throw new HttpError(
      StatusCodes.BAD_REQUEST,
      "Description must be at least 20 characters"
    );
  }

  if (type && !allowedTypes.includes(type)) {
    throw new HttpError(StatusCodes.BAD_REQUEST, "Invalid issue type");
  }

  if (status && !allowedStatus.includes(status)) {
    throw new HttpError(StatusCodes.BAD_REQUEST, "Invalid issue status");
  }

  if (status && role !== "maintainer") {
    throw new HttpError(
      StatusCodes.FORBIDDEN,
      "Only maintainers can change issue status"
    );
  }

  const updated = await updateIssue(id, { title, description, type, status });
  if (!updated) {
    throw new HttpError(StatusCodes.BAD_REQUEST, "No valid fields to update");
  }

  return sendSuccess(res, StatusCodes.OK, "Issue updated successfully", updated);
});

export const deleteIssueHandler = asyncHandler(async (req, res) => {
  const id = parseIssueId(req.params.id);
  const deleted = await deleteIssue(id);

  if (!deleted) {
    throw new HttpError(StatusCodes.NOT_FOUND, "Issue not found");
  }

  return sendSuccess(res, StatusCodes.OK, "Issue deleted successfully");
});

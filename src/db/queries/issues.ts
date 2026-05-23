import { pool } from "../pool.js";
import type { IssueStatus, IssueType } from "../../types/common.js";

export type IssueRecord = {
  id: number;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  reporter_id: number;
  created_at: string;
  updated_at: string;
};

export const createIssue = async (
  title: string,
  description: string,
  type: IssueType,
  reporterId: number
) => {
  const result = await pool.query<IssueRecord>(
    "INSERT INTO issues (title, description, type, reporter_id) VALUES ($1, $2, $3, $4) RETURNING id, title, description, type, status, reporter_id, created_at, updated_at",
    [title, description, type, reporterId]
  );
  return result.rows[0];
};

export const getIssueById = async (id: number) => {
  const result = await pool.query<IssueRecord>(
    "SELECT id, title, description, type, status, reporter_id, created_at, updated_at FROM issues WHERE id = $1",
    [id]
  );
  return result.rows[0] ?? null;
};

export const listIssues = async (filters: {
  type?: IssueType;
  status?: IssueStatus;
  sort?: "newest" | "oldest";
}) => {
  const conditions: string[] = [];
  const values: (IssueType | IssueStatus)[] = [];

  if (filters.type) {
    values.push(filters.type);
    conditions.push(`type = $${values.length}`);
  }

  if (filters.status) {
    values.push(filters.status);
    conditions.push(`status = $${values.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const order = filters.sort === "oldest" ? "ASC" : "DESC";

  const result = await pool.query<IssueRecord>(
    `SELECT id, title, description, type, status, reporter_id, created_at, updated_at FROM issues ${whereClause} ORDER BY created_at ${order}`,
    values
  );

  return result.rows;
};

export const updateIssue = async (
  id: number,
  fields: Partial<Pick<IssueRecord, "title" | "description" | "type" | "status">>
) => {
  const updates: string[] = [];
  const values: (string | IssueType | IssueStatus | number)[] = [];

  if (fields.title) {
    values.push(fields.title);
    updates.push(`title = $${values.length}`);
  }

  if (fields.description) {
    values.push(fields.description);
    updates.push(`description = $${values.length}`);
  }

  if (fields.type) {
    values.push(fields.type);
    updates.push(`type = $${values.length}`);
  }

  if (fields.status) {
    values.push(fields.status);
    updates.push(`status = $${values.length}`);
  }

  if (!updates.length) {
    return null;
  }

  updates.push("updated_at = NOW()");
  values.push(id);

  const result = await pool.query<IssueRecord>(
    `UPDATE issues SET ${updates.join(", ")} WHERE id = $${values.length} RETURNING id, title, description, type, status, reporter_id, created_at, updated_at`,
    values
  );

  return result.rows[0] ?? null;
};

export const deleteIssue = async (id: number) => {
  const result = await pool.query<{ id: number }>(
    "DELETE FROM issues WHERE id = $1 RETURNING id",
    [id]
  );
  return result.rows[0] ?? null;
};

export const countIssues = async () => {
  const result = await pool.query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM issues"
  );
  return Number.parseInt(result.rows[0]?.count ?? "0", 10);
};

export const countIssuesByStatus = async (status: IssueStatus) => {
  const result = await pool.query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM issues WHERE status = $1",
    [status]
  );
  return Number.parseInt(result.rows[0]?.count ?? "0", 10);
};

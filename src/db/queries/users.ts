import { pool } from "../pool.js";
import type { Role } from "../../types/common.js";

export type UserRecord = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: Role;
  created_at: string;
  updated_at: string;
};

export type PublicUser = Omit<UserRecord, "password">;

export const findUserByEmail = async (email: string) => {
  const result = await pool.query<UserRecord>(
    "SELECT id, name, email, password, role, created_at, updated_at FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0] ?? null;
};

export const createUser = async (
  name: string,
  email: string,
  password: string,
  role: Role
) => {
  const result = await pool.query<PublicUser>(
    "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at, updated_at",
    [name, email, password, role]
  );
  return result.rows[0];
};

export const getUsersByIds = async (ids: number[]) => {
  const result = await pool.query<Pick<UserRecord, "id" | "name" | "role">>(
    "SELECT id, name, role FROM users WHERE id = ANY($1::int[])",
    [ids]
  );
  return result.rows;
};

export const countUsers = async () => {
  const result = await pool.query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM users"
  );
  return Number.parseInt(result.rows[0]?.count ?? "0", 10);
};

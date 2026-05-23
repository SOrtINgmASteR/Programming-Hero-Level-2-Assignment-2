import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";

import { env } from "../../config/env.js";
import { createUser, findUserByEmail } from "../../db/queries/users.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { HttpError } from "../../utils/httpError.js";
import { sendSuccess } from "../../utils/response.js";
import type { Role } from "../../types/common.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeRole = (role?: string): Role => {
  if (!role) {
    return "contributor";
  }
  if (role !== "contributor" && role !== "maintainer") {
    throw new HttpError(StatusCodes.BAD_REQUEST, "Invalid role");
  }
  return role;
};

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  };

  if (!name || !email || !password) {
    throw new HttpError(
      StatusCodes.BAD_REQUEST,
      "Name, email, and password are required"
    );
  }

  if (!emailRegex.test(email)) {
    throw new HttpError(StatusCodes.BAD_REQUEST, "Invalid email format");
  }

  if (password.length < 6) {
    throw new HttpError(
      StatusCodes.BAD_REQUEST,
      "Password must be at least 6 characters"
    );
  }

  const userRole = normalizeRole(role);
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new HttpError(StatusCodes.CONFLICT, "Email already registered");
  }

  const hashedPassword = await bcrypt.hash(password, env.bcryptRounds);
  const user = await createUser(name, email, hashedPassword, userRole);

  return sendSuccess(res, StatusCodes.CREATED, "User registered successfully", user);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    throw new HttpError(
      StatusCodes.BAD_REQUEST,
      "Email and password are required"
    );
  }

  const user = await findUserByEmail(email);
  if (!user) {
    throw new HttpError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    throw new HttpError(StatusCodes.UNAUTHORIZED, "Invalid credentials");
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, role: user.role },
    env.jwtSecret,
    { expiresIn: "7d" }
  );

  const { password: _password, ...publicUser } = user;

  return sendSuccess(res, StatusCodes.OK, "Login successful", {
    token,
    user: publicUser
  });
});

import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";

import { env } from "../config/env.js";
import { sendError } from "../utils/response.js";
import type { Role } from "../types/common.js";

type JwtPayload = {
  id: number;
  name: string;
  role: Role;
};

const extractToken = (req: Request): string | null => {
  const header = req.headers.authorization;
  if (!header) {
    return null;
  }
  if (header.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }
  return header.trim();
};

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (!token) {
    return sendError(res, StatusCodes.UNAUTHORIZED, "Authorization token missing");
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
    if (!decoded?.id || !decoded?.name || !decoded?.role) {
      return sendError(res, StatusCodes.UNAUTHORIZED, "Invalid token payload");
    }
    req.user = {
      id: decoded.id,
      name: decoded.name,
      role: decoded.role
    };
    return next();
  } catch (error) {
    return sendError(res, StatusCodes.UNAUTHORIZED, "Invalid or expired token");
  }
};

export const requireRole = (role: Role) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, StatusCodes.UNAUTHORIZED, "Unauthorized");
    }
    if (req.user.role !== role) {
      return sendError(res, StatusCodes.FORBIDDEN, "Forbidden");
    }
    return next();
  };
};

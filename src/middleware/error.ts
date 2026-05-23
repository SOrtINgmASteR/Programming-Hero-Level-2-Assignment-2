import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { sendError } from "../utils/response.js";
import { HttpError } from "../utils/httpError.js";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof HttpError) {
    return sendError(res, err.statusCode, err.message, err.errors);
  }

  return sendError(
    res,
    StatusCodes.INTERNAL_SERVER_ERROR,
    "Internal server error"
  );
};

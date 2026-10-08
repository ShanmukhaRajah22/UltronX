import type { Request, Response, NextFunction } from "express";
import { apiError } from "../Utils/apiResponse.js";

/** Returns a standard 404 response for unmatched routes. */
export const notFoundHandler = (
    req: Request,
    _res: Response,
    next: NextFunction
): void => {
    next(apiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};
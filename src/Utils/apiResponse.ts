import type { Response } from "express";

export class ApiError extends Error {
    public readonly statusCode: number;
    public readonly errors?: unknown;

    constructor(
        statusCode: number,
        message: string,
        errors?: unknown
    ) {
        super(message);

        this.name = "ApiError";
        this.statusCode = statusCode;
        this.errors = errors;

        Error.captureStackTrace(this, this.constructor);
    }
}

export class ApiResponse<T = unknown> {
    constructor(
        public readonly statusCode: number,
        public readonly data: T,
        public readonly message = "Success"
    ) { }

    /** Sends the standard success response envelope. */
    send(res: Response): Response {
        return res.status(this.statusCode).json({
            success: true,
            statusCode: this.statusCode,
            message: this.message,
            data: this.data,
        });
    }
}

/** Creates and sends a standard successful API response. */
export const apiSuccess = <T>(
    res: Response,
    data: T,
    message = "Success",
    statusCode = 200
): Response => {
    return new ApiResponse(
        statusCode,
        data,
        message
    ).send(res);
};

/** Creates an API error for centralized error handling. */
export const apiError = (
    statusCode: number,
    message: string,
    errors?: unknown
): ApiError => {
    return new ApiError(
        statusCode,
        message,
        errors
    );
};
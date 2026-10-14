import type { Response } from "express";

/**
 * Base class for errors that carry an HTTP status code.
 */
export class HttpError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
  }
}

/** The client sent an invalid parameter (400). */
export class BadRequestError extends HttpError {
  constructor(message: string) {
    super(400, message);
  }
}

/** The requested resource does not exist (404). */
export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(404, message);
  }
}

/** An upstream provider (AniList, HiAnime, AniZip, ...) failed (502). */
export class UpstreamError extends HttpError {
  constructor(message: string) {
    super(502, message);
  }
}

/**
 * Sends a uniform error response. Known HttpErrors keep their status code,
 * anything unexpected becomes a 500.
 * The body shape `{ status: "error", message }` is unchanged from before.
 */
export function sendError(res: Response, error: unknown) {
  const statusCode = error instanceof HttpError ? error.statusCode : 500;
  const message = error instanceof Error ? error.message : "Unknown error";

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({ status: "error", message });
}

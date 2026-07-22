import type { NextFunction, Request, Response } from "express";

/**
 * Final error-handling middleware (must be registered last, with 4 args so
 * Express recognizes it as an error handler). Logs with full context per
 * constitution Principle II, then returns a generic 500 — never a silent
 * hang or an unhandled rejection.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  req.log?.error("request.unhandled_error", {
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });

  if (res.headersSent) {
    return;
  }
  res.status(500).json({ error: "internal_error" });
}

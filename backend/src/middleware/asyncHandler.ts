import type { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Express 4 does not catch rejected promises from async route handlers, which
 * would otherwise hang the request with no response. Wrapping every async
 * handler routes failures to the error-handling middleware instead (see
 * middleware/errorHandler.ts), keeping constitution Principle II's "no silent
 * failures" guarantee for the request path, not just inside try/catch blocks.
 */
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}

import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

type LogFields = Record<string, unknown>;

export interface Logger {
  info(event: string, fields?: LogFields): void;
  error(event: string, fields?: LogFields): void;
}

function write(level: "info" | "error", event: string, fields: LogFields = {}): void {
  const line = JSON.stringify({
    level,
    event,
    timestamp: new Date().toISOString(),
    ...fields,
  });
  if (level === "error") {
    console.error(line);
  } else {
    console.log(line);
  }
}

export function createLogger(baseFields: LogFields = {}): Logger {
  return {
    info: (event, fields) => write("info", event, { ...baseFields, ...fields }),
    error: (event, fields) => write("error", event, { ...baseFields, ...fields }),
  };
}

/**
 * Assigns a per-request correlation id and a scoped logger (req.log), then
 * logs entry/exit. Runs before auth so even rejected requests are traceable,
 * per constitution Principle II (Observability & Logging).
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const requestId = randomUUID();
  req.id = requestId;
  req.log = createLogger({ requestId, method: req.method, path: req.path });

  req.log.info("request.start");
  res.on("finish", () => {
    req.log.info("request.finish", { statusCode: res.statusCode });
  });

  next();
}

import type { NextFunction, Request, Response } from "express";
import { firebaseAuth } from "../config/firebase";

/**
 * Verifies the Firebase ID token on every request (constitution Principle III:
 * Firebase Authentication is the sole identity boundary). No session state is
 * kept server-side — each request is verified independently.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;

  if (!token) {
    res.status(401).json({ error: "unauthenticated" });
    return;
  }

  try {
    const decoded = await firebaseAuth.verifyIdToken(token);
    req.uid = decoded.uid;
    next();
  } catch (err) {
    req.log?.error("auth.verify_failed", { error: (err as Error).message });
    res.status(401).json({ error: "unauthenticated" });
  }
}

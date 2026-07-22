import type { Logger } from "../middleware/logging";

declare global {
  namespace Express {
    interface Request {
      id: string;
      log: Logger;
      /** Set by requireAuth middleware; present on every route past that middleware. */
      uid: string;
    }
  }
}

export {};

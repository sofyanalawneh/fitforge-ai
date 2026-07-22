import "dotenv/config";
import cors from "cors";
import express from "express";
import { requestLogger } from "./middleware/logging";
import { errorHandler } from "./middleware/errorHandler";
import { profileRouter } from "./api/profile";
import { plansRouter } from "./api/plans";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json());
app.use(requestLogger);

app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

app.use("/api/profile", profileRouter);
app.use("/api/plans", plansRouter);

// Must be registered last: Express identifies error-handling middleware by its
// four-argument signature and only invokes it after earlier middleware/routes
// call next(err) or an asyncHandler-wrapped route rejects.
app.use(errorHandler);

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(JSON.stringify({ level: "info", event: "server.start", port }));
});

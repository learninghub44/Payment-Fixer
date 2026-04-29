import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import cors from "cors";
import path from "path";
import fs from "fs";
import { pool, ensureSchema } from "./db";
import authRouter from "./routes/auth";
import membersRouter from "./routes/members";
import announcementsRouter from "./routes/announcements";
import leadersRouter from "./routes/leaders";
import welfareRouter from "./routes/welfare";
import paymentsRouter from "./routes/payments";

let schemaReady: Promise<void> | null = null;
function initSchemaOnce() {
  if (!schemaReady) {
    schemaReady = ensureSchema()
      .then(() => console.log("Schema ensured."))
      .catch((e) => {
        console.error("Schema init failed:", e);
        schemaReady = null;
      });
  }
  return schemaReady;
}

let cachedApp: express.Express | null = null;

export function createApp(): express.Express {
  if (cachedApp) return cachedApp;

  const app = express();

  // Behind a reverse proxy (Replit, Vercel)
  app.set("trust proxy", 1);

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));

  const PgSession = ConnectPgSimple(session);
  app.use(
    session({
      store: new PgSession({ pool, createTableIfMissing: true }),
      secret: process.env.SESSION_SECRET || "kuwesa-secret-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      },
    })
  );

  // Make sure schema migrations run before any request is handled.
  app.use(async (_req: Request, _res: Response, next: NextFunction) => {
    try {
      await initSchemaOnce();
    } catch {
      // continue — request will surface the real error
    }
    next();
  });

  app.get("/api/healthz", (_req: Request, res: Response) => {
    res.json({ ok: true, ts: new Date().toISOString() });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/members", membersRouter);
  app.use("/api/announcements", announcementsRouter);
  app.use("/api/leaders", leadersRouter);
  app.use("/api/welfare", welfareRouter);
  app.use("/api/payments", paymentsRouter);

  // Static uploads (leader photos). On Vercel the filesystem is read-only,
  // so the directory may not exist — wrap in try/catch.
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch {
    // Read-only FS (Vercel) — uploads won't persist there.
  }
  app.use("/uploads", express.static(uploadsDir));

  cachedApp = app;
  return app;
}

// Trigger schema init at module import time so it's already underway by the
// time the first request arrives in serverless environments.
initSchemaOnce();

import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import cors from "cors";
import { pool, ensureSchema } from "./db.js";
import authRouter from "./routes/auth.js";
import membersRouter from "./routes/members.js";
import announcementsRouter from "./routes/announcements.js";
import leadersRouter from "./routes/leaders.js";
import welfareRouter from "./routes/welfare.js";
import paymentsRouter from "./routes/payments.js";
import memberAuthRouter from "./routes/memberAuth.js";

// Schema init
let schemaReady: Promise<void> | null = null;
function initSchemaOnce() {
  if (!schemaReady) {
    schemaReady = ensureSchema()
      .then(() => console.log("✓ Schema ready"))
      .catch((e) => { console.error("Schema error:", e.message); schemaReady = null; });
  }
  return schemaReady;
}

let cachedApp: express.Express | null = null;

export function createApp(): express.Express {
  if (cachedApp) return cachedApp;
  const app = express();
  app.set("trust proxy", 1);

  // CORS
  app.use(cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (origin.endsWith(".pages.dev")) return cb(null, true);
      if (origin.includes("kuriaweststudents")) return cb(null, true);
      return cb(null, true);
    },
    credentials: true,
  }));

  // Body parsing
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  // Sessions (memory store — safe for free tier)
  app.use(session({
    secret: process.env.SESSION_SECRET || "kuwesa-secret-2024",
    resave: false,
    saveUninitialized: false,
    name: "kuwesa.sid",
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  }));

  console.log("✓ Security middleware configured");

  // Schema init on every request
  app.use(async (_req, _res, next) => {
    try { await initSchemaOnce(); } catch { /* continue */ }
    next();
  });

  // Health routes
  app.get("/api/healthz", (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));
  app.get("/api/wake-up", (_req, res) => res.json({ awake: true, ts: new Date().toISOString() }));
  app.get("/api/test-db", async (_req, res) => {
    try {
      const r = await pool.query("SELECT NOW() as time");
      res.json({ database: "connected", time: r.rows[0].time });
    } catch (e: any) {
      res.status(500).json({ database: "error", error: e.message });
    }
  });

  // Routes
  app.use("/api/auth", authRouter);
  app.use("/api/members", membersRouter);
  app.use("/api/announcements", announcementsRouter);
  app.use("/api/leaders", leadersRouter);
  app.use("/api/welfare", welfareRouter);
  app.use("/api/payments", paymentsRouter);
  app.use("/api/member", memberAuthRouter);

  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Error:", err?.message);
    res.status(err?.status || 500).json({ error: err?.message || "Internal server error" });
  });

  app.use((_req, res) => res.status(404).json({ error: "Not found" }));

  cachedApp = app;
  return app;
}

initSchemaOnce();

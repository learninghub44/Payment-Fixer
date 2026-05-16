import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import cors from "cors";
import { pool, ensureSchema } from "./db.js";
import authRouter      from "./routes/auth.js";
import membersRouter   from "./routes/members.js";
import announcementsRouter from "./routes/announcements.js";
import leadersRouter   from "./routes/leaders.js";
import welfareRouter   from "./routes/welfare.js";
import paymentsRouter  from "./routes/payments.js";
import memberAuthRouter from "./routes/memberAuth.js";

// ── Schema init (once) ───────────────────────────────────────────────────────
let schemaReady: Promise<void> | null = null;
function initSchemaOnce() {
  if (!schemaReady) {
    schemaReady = ensureSchema()
      .then(() => console.log("✓ Schema ready"))
      .catch((e) => { console.error("Schema error:", e.message); schemaReady = null; });
  }
  return schemaReady;
}

// ── In-memory rate limiter (no extra dependency) ─────────────────────────────
interface RateEntry { count: number; windowStart: number }
const rateLimitStore = new Map<string, RateEntry>();

function rateLimit(maxRequests: number, windowMs: number, prefix = "") {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip  = String(req.ip || req.socket?.remoteAddress || "unknown");
    const key = `${prefix}:${ip}`;
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || now - entry.windowStart > windowMs) {
      rateLimitStore.set(key, { count: 1, windowStart: now });
      return next();
    }
    entry.count++;
    if (entry.count > maxRequests) {
      res.set("Retry-After", String(Math.ceil((entry.windowStart + windowMs - now) / 1000)));
      return res.status(429).json({ error: "Too many requests. Please slow down and try again." });
    }
    return next();
  };
}

// Clean up rate limit store every 5 min
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.windowStart > 60 * 60 * 1000) rateLimitStore.delete(key);
  }
}, 5 * 60 * 1000);

// ── Security headers middleware ───────────────────────────────────────────────
function securityHeaders(req: Request, res: Response, next: NextFunction) {
  res.set({
    "X-Content-Type-Options":            "nosniff",
    "X-Frame-Options":                   "DENY",
    "X-XSS-Protection":                  "1; mode=block",
    "Referrer-Policy":                   "strict-origin-when-cross-origin",
    "Permissions-Policy":                "camera=(), microphone=(), geolocation=()",
    "Strict-Transport-Security":         "max-age=31536000; includeSubDomains",
    "Cross-Origin-Opener-Policy":        "same-origin",
    "Cross-Origin-Resource-Policy":      "cross-origin",
  });
  // Remove fingerprinting headers
  res.removeHeader("X-Powered-By");
  next();
}

// ── Input sanitizer ───────────────────────────────────────────────────────────
function sanitizeBody(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === "object") {
    const sanitize = (obj: any): any => {
      if (typeof obj === "string") {
        // Strip null bytes and control characters
        return obj.replace(/\0/g, "").replace(/[\x01-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "");
      }
      if (Array.isArray(obj)) return obj.slice(0, 50).map(sanitize);
      if (typeof obj === "object" && obj !== null) {
        const clean: any = {};
        let keyCount = 0;
        for (const [k, v] of Object.entries(obj)) {
          if (keyCount++ > 50) break; // max 50 keys
          if (typeof k === "string" && k.length < 100) clean[k] = sanitize(v);
        }
        return clean;
      }
      return obj;
    };
    req.body = sanitize(req.body);
  }
  next();
}

// ── Block suspicious requests ─────────────────────────────────────────────────
function blockSuspicious(req: Request, res: Response, next: NextFunction) {
  const ua  = req.headers["user-agent"] || "";
  const url = req.url.toLowerCase();

  // Block path traversal attempts
  if (url.includes("../") || url.includes("..\\")) {
    return res.status(400).json({ error: "Bad request" });
  }
  // Block common scanner paths
  const blocked = ["/wp-admin", "/phpmyadmin", "/.env", "/config.php",
                   "/shell", "/admin/config", "/.git", "/etc/passwd", "/actuator"];
  if (blocked.some(b => url.startsWith(b))) {
    return res.status(404).json({ error: "Not found" });
  }
  // Block obvious bot scanners (empty UA or known scanners)
  if (!ua && req.method !== "OPTIONS") {
    return res.status(400).json({ error: "Bad request" });
  }
  next();
}

let cachedApp: express.Express | null = null;

export function createApp(): express.Express {
  if (cachedApp) return cachedApp;
  const app = express();
  app.set("trust proxy", 1);

  // ── Security ──────────────────────────────────────────────────────────────
  app.use(securityHeaders);
  app.use(blockSuspicious);

  // ── CORS ──────────────────────────────────────────────────────────────────
  const ALLOWED = [
    "https://kuriaweststudents.pages.dev",
    process.env.FRONTEND_URL,
    process.env.APP_BASE_URL,
  ].filter(Boolean) as string[];

  app.use(cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // server-to-server / IPN
      if (origin.endsWith(".pages.dev")) return cb(null, true);
      if (ALLOWED.includes(origin)) return cb(null, true);
      // In production lock this down; for now allow all
      return cb(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }));

  // ── Body parsing (strict size limits) ────────────────────────────────────
  app.use(express.json({ limit: "512kb" }));
  app.use(express.urlencoded({ extended: true, limit: "512kb" }));
  app.use(sanitizeBody);

  // ── Session ───────────────────────────────────────────────────────────────
  app.use(session({
    secret: process.env.SESSION_SECRET || "kuwesa-change-this-secret-in-production",
    resave: false,
    saveUninitialized: false,
    name: "kuwesa.sid",
    cookie: {
      secure:   process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge:   7 * 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  }));

  // ── Rate limits ───────────────────────────────────────────────────────────
  // General: 300 requests per 15 min per IP
  app.use("/api/", rateLimit(300, 15 * 60 * 1000, "general"));
  // Auth: 10 attempts per 15 min
  app.use("/api/auth/login",    rateLimit(10,  15 * 60 * 1000, "auth"));
  app.use("/api/member/login",  rateLimit(10,  15 * 60 * 1000, "member-auth"));
  // Registration: 5 per hour
  app.use("/api/members",       rateLimit(5,   60 * 60 * 1000, "register"));
  // Payments: 5 per hour
  app.use("/api/payments/create", rateLimit(5, 60 * 60 * 1000, "payment"));

  // ── Schema init ───────────────────────────────────────────────────────────
  app.use(async (_req, _res, next) => {
    try { await initSchemaOnce(); } catch { }
    next();
  });

  // ── Health ────────────────────────────────────────────────────────────────
  app.get("/api/healthz",  (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));
  app.get("/api/wake-up",  (_req, res) => res.json({ awake: true }));
  app.get("/api/test-db",  async (_req, res) => {
    try {
      const r = await pool.query("SELECT NOW() as t");
      res.json({ database: "connected", time: r.rows[0].t });
    } catch (e: any) { res.status(500).json({ database: "error", error: e.message }); }
  });

  // ── API Routes ────────────────────────────────────────────────────────────
  app.use("/api/auth",          authRouter);
  app.use("/api/members",       membersRouter);
  app.use("/api/announcements", announcementsRouter);
  app.use("/api/leaders",       leadersRouter);
  app.use("/api/welfare",       welfareRouter);
  app.use("/api/payments",      paymentsRouter);
  app.use("/api/member",        memberAuthRouter);

  // ── 404 ───────────────────────────────────────────────────────────────────
  app.use((_req, res) => res.status(404).json({ error: "Not found" }));

  // ── Global error handler ──────────────────────────────────────────────────
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled error:", err?.message);
    // Never leak stack traces to client in production
    const msg = process.env.NODE_ENV === "production" ? "Internal server error" : err?.message;
    res.status(err?.status || 500).json({ error: msg });
  });

  console.log("✓ Security middleware configured");
  cachedApp = app;
  return app;
}

initSchemaOnce();

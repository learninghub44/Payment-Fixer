import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import cors from "cors";
import { pool, ensureSchema } from "./db.js";
import authRouter       from "./routes/auth.js";
import membersRouter    from "./routes/members.js";
import announcementsRouter from "./routes/announcements.js";
import leadersRouter    from "./routes/leaders.js";
import welfareRouter    from "./routes/welfare.js";
import paymentsRouter   from "./routes/payments.js";
import memberAuthRouter from "./routes/memberAuth.js";

// ── Schema init ───────────────────────────────────────────────────────────────
let schemaReady: Promise<void> | null = null;
function initSchemaOnce() {
  if (!schemaReady) {
    schemaReady = ensureSchema()
      .then(() => console.log("✓ Schema ready"))
      .catch((e) => { console.error("Schema error:", e.message); schemaReady = null; });
  }
  return schemaReady;
}

// ── Rate limiter (no extra deps) ──────────────────────────────────────────────
const rlStore = new Map<string, { count: number; windowStart: number }>();
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of rlStore.entries())
    if (now - v.windowStart > 2 * 60 * 60 * 1000) rlStore.delete(k);
}, 10 * 60 * 1000);

function rateLimit(max: number, windowMs: number, prefix = "") {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip  = String(req.ip || "unknown");
    const key = `${prefix}:${ip}`;
    const now = Date.now();
    const e   = rlStore.get(key);
    if (!e || now - e.windowStart > windowMs) {
      rlStore.set(key, { count: 1, windowStart: now }); return next();
    }
    e.count++;
    if (e.count > max) {
      res.set("Retry-After", String(Math.ceil((e.windowStart + windowMs - now) / 1000)));
      return res.status(429).json({ error: "Too many requests. Please try again later." });
    }
    return next();
  };
}

// ── Security headers ──────────────────────────────────────────────────────────
function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.removeHeader("X-Powered-By");
  res.set({
    "X-Content-Type-Options":       "nosniff",
    "X-Frame-Options":              "DENY",
    "X-XSS-Protection":            "1; mode=block",
    "Referrer-Policy":             "strict-origin-when-cross-origin",
    "Permissions-Policy":          "camera=(), microphone=(), geolocation=()",
    "Strict-Transport-Security":   "max-age=31536000; includeSubDomains",
    "Cross-Origin-Resource-Policy":"cross-origin",
  });
  next();
}

// ── Input sanitizer ───────────────────────────────────────────────────────────
function sanitizeBody(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === "object") {
    const sanitize = (v: any): any => {
      if (typeof v === "string") return v.replace(/\0/g, "").replace(/[\x01-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "").slice(0, 5000);
      if (Array.isArray(v)) return v.slice(0, 50).map(sanitize);
      if (v && typeof v === "object") {
        const clean: any = {}; let n = 0;
        for (const [k, val] of Object.entries(v)) { if (n++ > 50) break; clean[k] = sanitize(val); }
        return clean;
      }
      return v;
    };
    req.body = sanitize(req.body);
  }
  next();
}

// ── Block scanners & probes ───────────────────────────────────────────────────
function blockSuspicious(req: Request, res: Response, next: NextFunction) {
  const url = req.url.toLowerCase();
  const ua  = req.headers["user-agent"] || "";
  if (url.includes("../") || url.includes("..\\")) return res.status(400).json({ error: "Bad request" });
  const probes = ["/wp-admin","/phpmyadmin","/.env","/config.php","/shell","/.git",
                  "/etc/passwd","/actuator","/xmlrpc","/wp-login","/cgi-bin","/admin.php"];
  if (probes.some(p => url.startsWith(p))) return res.status(404).json({ error: "Not found" });
  if (!ua && req.method !== "OPTIONS") return res.status(400).json({ error: "Bad request" });
  next();
}

let cachedApp: express.Express | null = null;

export function createApp(): express.Express {
  if (cachedApp) return cachedApp;
  const app = express();
  app.set("trust proxy", 1);

  app.use(securityHeaders);
  app.use(blockSuspicious);

  // ── CORS — locked to KUWESA Cloudflare domain only ───────────────────────
  const ALLOWED_ORIGINS = [
    "https://kuriaweststudents.pages.dev",  // Production frontend
    "https://kuwesa-payment-api.onrender.com", // Backend self-calls
  ];

  app.use(cors({
    origin: (origin, cb) => {
      // Allow no-origin (Pesapal IPN, curl, mobile apps)
      if (!origin) return cb(null, true);
      // Allow exact matches only
      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      // Allow Cloudflare preview deploys (*.pages.dev subdomains for kuriaweststudents)
      if (/^https:\/\/[a-z0-9-]+\.kuriaweststudents\.pages\.dev$/.test(origin)) return cb(null, true);
      console.warn(`[CORS] Blocked origin: ${origin}`);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
    allowedHeaders: ["Content-Type","Authorization","X-Requested-With"],
  }));

  // ── Body parsing ──────────────────────────────────────────────────────────
  app.use(express.json({ limit: "512kb" }));
  app.use(express.urlencoded({ extended: true, limit: "512kb" }));
  app.use(sanitizeBody);

  // ── Session ───────────────────────────────────────────────────────────────
  app.use(session({
    secret: process.env.SESSION_SECRET || "kuwesa-must-change-this-secret",
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
  app.use("/api/",               rateLimit(300, 15 * 60 * 1000, "api"));
  app.use("/api/auth/login",     rateLimit(10,  15 * 60 * 1000, "auth"));
  app.use("/api/member/login",   rateLimit(10,  15 * 60 * 1000, "mauth"));
  app.use("/api/members",        rateLimit(5,   60 * 60 * 1000, "reg"));
  app.use("/api/payments/create",rateLimit(5,   60 * 60 * 1000, "pay"));

  // ── Schema ────────────────────────────────────────────────────────────────
  app.use(async (_req, _res, next) => {
    try { await initSchemaOnce(); } catch {}
    next();
  });

  // ── Health ────────────────────────────────────────────────────────────────
  app.get("/api/healthz", (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));
  app.get("/api/wake-up", (_req, res) => res.json({ awake: true }));
  app.get("/api/test-db", async (_req, res) => {
    try {
      const r = await pool.query("SELECT NOW() as t");
      res.json({ database: "connected", time: r.rows[0].t });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // ── Routes ────────────────────────────────────────────────────────────────
  app.use("/api/auth",          authRouter);
  app.use("/api/members",       membersRouter);
  app.use("/api/announcements", announcementsRouter);
  app.use("/api/leaders",       leadersRouter);
  app.use("/api/welfare",       welfareRouter);
  app.use("/api/payments",      paymentsRouter);
  app.use("/api/member",        memberAuthRouter);

  // ── 404 ───────────────────────────────────────────────────────────────────
  app.use((_req, res) => res.status(404).json({ error: "Not found" }));

  // ── Error handler ─────────────────────────────────────────────────────────
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Error:", err?.message);
    const isProd = process.env.NODE_ENV === "production";
    res.status(err?.status || 500).json({
      error: isProd ? "Internal server error" : (err?.message || "Unknown error"),
    });
  });

  console.log("✓ Security middleware configured");
  cachedApp = app;
  return app;
}

initSchemaOnce();

import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import ConnectPgSimple from "connect-pg-simple";
import cors from "cors";
import path from "path";
import fs from "fs";
import { pool, ensureSchema } from "./db.js";
import authRouter from "./routes/auth.js";
import membersRouter from "./routes/members.js";
import announcementsRouter from "./routes/announcements.js";
import leadersRouter from "./routes/leaders.js";
import welfareRouter from "./routes/welfare.js";
import paymentsRouter from "./routes/payments.js";
import memberAuthRouter from "./routes/memberAuth.js";

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

  app.get("/", (_req: Request, res: Response) => {
    res.json({
      message: "KUWESA Payment API",
      version: "1.0.0",
      endpoints: {
        health: "/api/healthz",
        auth: {
          login: "POST /api/auth/login",
          logout: "POST /api/auth/logout",
          me: "GET /api/auth/me"
        },
        members: {
          create: "POST /api/members",
          list: "GET /api/members (requires auth)"
        },
        payments: {
          create: "POST /api/payments",
          list: "GET /api/payments (requires auth)"
        },
        announcements: {
          list: "GET /api/announcements",
          create: "POST /api/announcements (requires auth)"
        },
        leaders: {
          list: "GET /api/leaders",
          create: "POST /api/leaders (requires auth)"
        },
        welfare: {
          list: "GET /api/welfare",
          create: "POST /api/welfare (requires auth)"
        }
      }
    });
  });

  app.get("/api/healthz", (_req: Request, res: Response) => {
    res.json({ ok: true, ts: new Date().toISOString() });
  });

  app.get("/api/wake-up", (_req: Request, res: Response) => {
    res.json({ 
      message: "Server is awake!", 
      ts: new Date().toISOString(),
      status: "ready"
    });
  });

  app.get("/api/test-db", async (_req: Request, res: Response) => {
    try {
      // Check if database URL is configured
      const connectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
      if (!connectionString) {
        return res.status(500).json({ 
          database: "error", 
          error: "No database URL configured. Set SUPABASE_DATABASE_URL or DATABASE_URL environment variable."
        });
      }
      
      const result = await pool.query('SELECT NOW() as current_time, current_database() as database');
      res.json({ 
        database: "connected", 
        time: result.rows[0].current_time,
        database_name: result.rows[0].database,
        connection_configured: true
      });
    } catch (error) {
      res.status(500).json({ 
        database: "error", 
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  });

  app.get("/api/check-admin", async (_req: Request, res: Response) => {
    try {
      const { db } = await import("./db.js");
      const { adminUsers } = await import("./shared/schema.js");
      const { eq } = await import("drizzle-orm");
      
      const admin = await db.select().from(adminUsers).where(eq(adminUsers.email, "kuwesa23@gmail.com"));
      
      if (admin.length > 0) {
        res.json({ 
          admin_exists: true, 
          admin_email: admin[0].email,
          message: "Admin user found in database"
        });
      } else {
        res.json({ 
          admin_exists: false, 
          message: "Admin user not found - database seeding may have failed"
        });
      }
    } catch (error) {
      res.status(500).json({ 
        admin_exists: "error", 
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  });

  app.get("/api/check-tables", async (_req: Request, res: Response) => {
    try {
      const result = await pool.query(`
        SELECT table_name, table_type 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);
      
      res.json({
        tables: result.rows,
        message: "Database tables check"
      });
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  });

  app.use("/api/auth", authRouter);
  app.use("/api/members", membersRouter);
  app.use("/api/announcements", announcementsRouter);
  app.use("/api/leaders", leadersRouter);
  app.use("/api/welfare", welfareRouter);
  app.use("/api/payments", paymentsRouter);
  app.use('/api/member', memberAuthRouter);

  // Global error handler - ensures JSON responses for unhandled errors
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled error:", err?.message || String(err));
    res.status(err?.status || 500).json({
      error: err?.message || "Internal server error"
    });
  });

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: "Not found" });
  });

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

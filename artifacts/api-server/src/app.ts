import express, { Express } from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import { createClient } from "@supabase/supabase-js";

import { setupSecurity, validateRequest, errorHandler } from "./middleware/security.js";
import { requireAdmin } from "./middleware/requireAdmin.js";

import membersRouter from "./routes/members.js";
import memberAuthRouter from "./routes/memberAuth.js";
import leadersRouter from "./routes/leaders.js";
import paymentsRouter from "./routes/payments.js";
import announcementsRouter from "./routes/announcements.js";
import campaignsRouter from "./routes/campaigns.js";
import adminRouter from "./routes/admin.js";

export function createApp(): Express {
  const app = express();

  // Security setup
  setupSecurity(app);

  // Parsers
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ limit: "10kb", extended: true }));
  app.use(cookieParser());

  // Session
  const supabase = createClient(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_ANON_KEY || ""
  );

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: "strict",
      },
      store: new (require("connect-pg-simple")(session))({
        conString: process.env.SUPABASE_DATABASE_URL,
        tableName: "sessions",
      }),
    })
  );

  // Request validation
  app.use(validateRequest);

  // Health check
  app.get("/api/healthz", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API Routes
  app.use("/api/members", membersRouter);
  app.use("/api/member", memberAuthRouter);
  app.use("/api/leaders", leadersRouter);
  app.use("/api/payments", paymentsRouter);
  app.use("/api/announcements", announcementsRouter);
  app.use("/api/campaigns", campaignsRouter);
  app.use("/api/admin", adminRouter);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  // Error handler
  app.use(errorHandler);

  return app;
}

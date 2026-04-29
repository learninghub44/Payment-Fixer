import "dotenv/config";
import express from "express";
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

const app = express();
const PORT = Number(process.env.PORT || 8080);

// Behind Replit's reverse proxy
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

// Health check
app.get("/api/healthz", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.use("/api/auth", authRouter);
app.use("/api/members", membersRouter);
app.use("/api/announcements", announcementsRouter);
app.use("/api/leaders", leadersRouter);
app.use("/api/welfare", welfareRouter);
app.use("/api/payments", paymentsRouter);

const uploadsDir = path.join(process.cwd(), "public", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

app.listen(PORT, "0.0.0.0", async () => {
  console.log(`KUWESA server listening on port ${PORT}`);
  await ensureSchema();
  console.log("Schema ensured.");
  const base =
    process.env.APP_BASE_URL ||
    `https://${(process.env.REPLIT_DOMAINS || "").split(",")[0]?.trim() || "localhost"}`;
  console.log(`Pesapal IPN will register against: ${base}/api/payments/ipn`);
});

export default app;

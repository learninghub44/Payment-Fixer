import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../db.js";

const router = Router();

// Brute force protection: track failed attempts in memory
const failedAttempts = new Map<string, { count: number; lockedUntil: number }>();

function checkBruteForce(ip: string): boolean {
  const record = failedAttempts.get(ip);
  if (!record) return false;
  if (record.lockedUntil > Date.now()) return true; // still locked
  if (record.count >= 5) {
    record.lockedUntil = Date.now() + 15 * 60 * 1000; // lock 15 min
    return true;
  }
  return false;
}

function recordFailure(ip: string) {
  const record = failedAttempts.get(ip) || { count: 0, lockedUntil: 0 };
  record.count++;
  if (record.count >= 5) record.lockedUntil = Date.now() + 15 * 60 * 1000;
  failedAttempts.set(ip, record);
}

function clearFailures(ip: string) {
  failedAttempts.delete(ip);
}

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const ip = String(req.ip || req.socket.remoteAddress || "unknown");

    if (checkBruteForce(ip)) {
      return res.status(429).json({ error: "Too many failed attempts. Try again in 15 minutes." });
    }

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Sanitize input
    const cleanEmail = String(email).trim().toLowerCase().slice(0, 200);

    const { rows } = await pool.query(
      `SELECT id, email, full_name, password_hash, role, status FROM admin_users WHERE email=$1 LIMIT 1`,
      [cleanEmail]
    );

    if (rows.length === 0) {
      recordFailure(ip);
      // Same error message as wrong password — prevents user enumeration
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = rows[0];

    if (user.status !== "active") {
      return res.status(403).json({ error: "Account is not active" });
    }

    const match = await bcrypt.compare(String(password), user.password_hash);
    if (!match) {
      recordFailure(ip);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    clearFailures(ip);

    // Regenerate session ID to prevent session fixation
    req.session.regenerate((err) => {
      if (err) return res.status(500).json({ error: "Session error" });
      (req.session as any).adminId    = user.id;
      (req.session as any).adminEmail = user.email;
      (req.session as any).adminRole  = user.role;
      console.log(`[Auth] Admin login: ${user.email}`);
      return res.json({ ok: true, email: user.email, role: user.role });
    });
  } catch (e: any) {
    console.error("[Auth] Login error:", e.message);
    return res.status(500).json({ error: "Login failed" });
  }
});

// POST /api/auth/logout
router.post("/logout", (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.clearCookie("kuwesa.sid");
    res.clearCookie("connect.sid");
    return res.json({ ok: true });
  });
});

// GET /api/auth/me
router.get("/me", (req: Request, res: Response) => {
  const session = req.session as any;
  if (!session.adminId) return res.status(401).json({ error: "Not authenticated" });
  return res.json({ id: session.adminId, email: session.adminEmail, role: session.adminRole });
});

export default router;

import { Router, Request, Response } from "express";
import { pool } from "../db.js";

const router = Router();

// Brute force protection
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

function isLocked(ip: string) {
  const r = loginAttempts.get(ip);
  if (!r) return false;
  if (r.lockedUntil > Date.now()) return true;
  if (r.count >= 10) { r.lockedUntil = Date.now() + 10 * 60 * 1000; return true; }
  return false;
}
function fail(ip: string) {
  const r = loginAttempts.get(ip) || { count: 0, lockedUntil: 0 };
  r.count++;
  loginAttempts.set(ip, r);
}
function clear(ip: string) { loginAttempts.delete(ip); }

// POST /api/member/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const ip = String(req.ip || "unknown");
    if (isLocked(ip)) return res.status(429).json({ error: "Too many attempts. Wait 10 minutes." });

    const { fullName, phone } = req.body;
    if (!fullName?.trim() || !phone?.trim()) {
      return res.status(400).json({ error: "Name and phone required" });
    }

    const cleanName  = String(fullName).trim().slice(0, 200);
    const cleanPhone = String(phone).trim().slice(0, 20);

    const { rows } = await pool.query(
      `SELECT id, full_name, phone, status, tier, institution, county
       FROM members WHERE LOWER(full_name)=LOWER($1) AND phone=$2 LIMIT 1`,
      [cleanName, cleanPhone]
    );

    if (rows.length === 0) {
      fail(ip);
      return res.status(404).json({ error: "Member not found. Check your name and phone match your registration." });
    }

    clear(ip);
    const member = rows[0];

    req.session.regenerate((err) => {
      if (err) return res.status(500).json({ error: "Session error" });
      (req.session as any).memberId    = member.id;
      (req.session as any).memberName  = member.full_name;
      (req.session as any).memberPhone = member.phone;
      console.log(`[MemberAuth] Login: ${member.full_name}`);
      return res.json({
        id: member.id, fullName: member.full_name,
        status: member.status, tier: member.tier,
      });
    });
  } catch (e: any) {
    console.error("[MemberAuth] Error:", e.message);
    return res.status(500).json({ error: "Login failed" });
  }
});

// GET /api/member/me
router.get("/me", (req: Request, res: Response) => {
  const s = req.session as any;
  if (!s.memberId) return res.status(401).json({ error: "Not logged in" });
  return res.json({ id: s.memberId, name: s.memberName, phone: s.memberPhone });
});

// GET /api/member/:id — member profile
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const s = req.session as any;
    if (!s.memberId) return res.status(401).json({ error: "Not logged in" });
    // Members can only view their own profile
    if (s.memberId !== req.params.id) return res.status(403).json({ error: "Forbidden" });

    const { rows } = await pool.query(
      `SELECT id, full_name, phone, email, category, institution, county,
              tier, status, joined_at FROM members WHERE id=$1`, [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Member not found" });
    return res.json(rows[0]);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// POST /api/member/logout
router.post("/logout", (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.clearCookie("kuwesa.sid");
    return res.json({ ok: true });
  });
});

export default router;

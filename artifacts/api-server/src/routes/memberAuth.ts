import { Router, Request, Response } from "express";
import { db } from "../db.js";
import { members } from "../shared/schema.js";
import { and, eq, ilike } from "drizzle-orm";

const router = Router();

// Member login by name + phone (case-insensitive name)
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { fullName, phone } = req.body;
    if (!fullName || !phone) {
      return res.status(400).json({ error: "Name and phone required" });
    }

    console.log(`Member login attempt: ${fullName} / ${phone}`);

    // Search with case-insensitive name matching
    const rows = await db.select().from(members).where(
      and(
        ilike(members.fullName, fullName),
        eq(members.phone, phone)
      )
    );

    console.log(`Found ${rows.length} matching members`);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Member not found. Check your name and phone match your registration exactly." });
    }

    const member = rows[0];
    (req.session as any).memberId = member.id;
    (req.session as any).memberName = member.fullName;
    (req.session as any).memberPhone = member.phone;

    console.log(`Member ${member.id} logged in successfully`);
    return res.json({ id: member.id, fullName: member.fullName, status: member.status });
  } catch (e: any) {
    console.error("Member login error:", e.message);
    return res.status(500).json({ error: e?.message || "Login failed" });
  }
});

// Get current member
router.get("/me", (req: Request, res: Response) => {
  const memberId = (req.session as any).memberId;
  if (!memberId) {
    return res.status(401).json({ error: "Not logged in" });
  }
  return res.json({
    id: memberId,
    name: (req.session as any).memberName,
    phone: (req.session as any).memberPhone,
  });
});

// Get member profile
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const memberId = (req.session as any).memberId;
    if (!memberId) {
      return res.status(401).json({ error: "Not logged in" });
    }
    if (memberId !== req.params.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const rows = await db.select().from(members).where(eq(members.id, memberId));
    if (rows.length === 0) {
      return res.status(404).json({ error: "Member not found" });
    }

    return res.json(rows[0]);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message });
  }
});

// Member logout
router.post("/logout", (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Logout failed" });
    return res.json({ ok: true });
  });
});

export default router;

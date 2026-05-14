import { Router, Request, Response } from "express";
import { db } from "../db.js";
import { members } from "../shared/schema.js";
import { eq } from "drizzle-orm";

const router = Router();

// Member login by phone
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "Phone required" });

    const [member] = await db.select().from(members).where(eq(members.phone, phone));
    if (!member) return res.status(404).json({ error: "Member not found" });

    // Set member session
    (req.session as any).memberId = member.id;
    (req.session as any).memberName = member.fullName;

    return res.json({ id: member.id, fullName: member.fullName });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message });
  }
});

// Get current member
router.get("/me", (req: Request, res: Response) => {
  const memberId = (req.session as any).memberId;
  if (!memberId) return res.status(401).json({ error: "Not logged in" });
  return res.json({ id: memberId, name: (req.session as any).memberName });
});

// Get member profile
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const memberId = (req.session as any).memberId;
    if (!memberId) return res.status(401).json({ error: "Not logged in" });
    if (memberId !== req.params.id) return res.status(403).json({ error: "Forbidden" });

    const [member] = await db.select().from(members).where(eq(members.id, memberId));
    if (!member) return res.status(404).json({ error: "Member not found" });

    return res.json(member);
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

import { Router, Request, Response } from "express";
import { db } from "../db.js";
import { members } from "../shared/schema.js";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const {
    fullName, phone, email, category, institution, course, yearOfStudy,
    studentNumber, county, subCounty, dateOfBirth, gender,
    nextOfKinName, nextOfKinPhone, skills, tier,
  } = req.body;

  if (!fullName || !phone || !category || !institution || !county) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Validate tier
  const validTiers = ["Member", "Leader", "Patron"];
  const memberTier = validTiers.includes(tier) ? tier : "Member";

  // Validate date format if provided
  let parsedDateOfBirth = null;
  if (dateOfBirth) {
    const date = new Date(dateOfBirth);
    if (!isNaN(date.getTime())) {
      parsedDateOfBirth = date.toISOString().split('T')[0];
    }
  }

  try {
    const [member] = await db.insert(members).values({
      fullName,
      phone,
      email: email || null,
      category,
      institution,
      course: course || null,
      yearOfStudy: yearOfStudy || null,
      studentNumber: studentNumber || null,
      county,
      subCounty: subCounty || null,
      dateOfBirth: parsedDateOfBirth,
      gender: gender || null,
      nextOfKinName: nextOfKinName || null,
      nextOfKinPhone: nextOfKinPhone || null,
      skills: skills || null,
      tier: memberTier,
      status: "Pending Payment",
    }).returning();

    return res.json({ id: member.id });
  } catch (error: any) {
    console.error("Member registration error:", error);
    return res.status(500).json({ error: "Failed to register member. Please try again." });
  }
});

router.get("/", requireAdmin, async (_req: Request, res: Response) => {
  const rows = await db.select().from(members).orderBy(desc(members.joinedAt));
  return res.json(rows);
});

router.patch("/:id/status", requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: "Status required" });
  await db.update(members).set({ status }).where(eq(members.id, String(id)));
  return res.json({ ok: true });
});

router.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  await db.delete(members).where(eq(members.id, String(id)));
  return res.json({ ok: true });
});

export default router;

import { Router, Request, Response } from "express";
import { db } from "../db.js";
import { members } from "../shared/schema.js";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      fullName, phone, email, category, institution, course, yearOfStudy,
      studentNumber, county, subCounty, dateOfBirth, gender,
      nextOfKinName, nextOfKinPhone, skills, tier,
    } = req.body;

    if (!fullName || !phone || !category || !institution || !county) {
      return res.status(400).json({ error: "Missing required fields: fullName, phone, category, institution, county" });
    }

    // Validate tier
    const validTiers = ["Member", "Leader", "Patron"];
    const memberTier = validTiers.includes(tier) ? tier : "Member";

    console.log(`Registering member: ${fullName}, ${phone}, ${category}`);

    // Insert and get back the member
    const result = await db.insert(members).values({
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email?.trim() || null,
      category,
      institution,
      course: course || null,
      yearOfStudy: yearOfStudy || null,
      studentNumber: studentNumber || null,
      county,
      subCounty: subCounty || null,
      dateOfBirth: dateOfBirth || null,
      gender: gender || null,
      nextOfKinName: nextOfKinName || null,
      nextOfKinPhone: nextOfKinPhone || null,
      skills: skills || null,
      tier: memberTier,
      status: "Pending Payment",
    }).returning();

    if (!result || result.length === 0) {
      console.error("Insert returned no rows");
      return res.status(500).json({ error: "Failed to create member record" });
    }

    const member = result[0];
    console.log(`Member created successfully: ${member.id}`);
    return res.json({ id: member.id });
  } catch (error: any) {
    console.error("Member registration error:", error.message);
    return res.status(500).json({ error: error?.message || "Failed to register member" });
  }
});

router.get("/", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const rows = await db.select().from(members).orderBy(desc(members.joinedAt));
    return res.json(rows);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message });
  }
});

router.patch("/:id/status", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "Status required" });
    await db.update(members).set({ status }).where(eq(members.id, String(id)));
    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message });
  }
});

router.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.delete(members).where(eq(members.id, String(id)));
    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message });
  }
});

export default router;

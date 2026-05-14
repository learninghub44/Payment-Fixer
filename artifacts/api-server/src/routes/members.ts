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
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log(`Registering: ${fullName}, ${phone}`);

    // Build values object, only including provided fields
    const values: any = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      category,
      institution,
      county,
    };

    // Add optional fields only if provided
    if (email) values.email = email.trim();
    if (course) values.course = course;
    if (yearOfStudy) values.yearOfStudy = yearOfStudy;
    if (studentNumber) values.studentNumber = studentNumber;
    if (subCounty) values.subCounty = subCounty;
    if (dateOfBirth) values.dateOfBirth = dateOfBirth;
    if (gender) values.gender = gender;
    if (nextOfKinName) values.nextOfKinName = nextOfKinName;
    if (nextOfKinPhone) values.nextOfKinPhone = nextOfKinPhone;
    if (skills) values.skills = skills;
    
    // Don't include tier/status - let database defaults handle them
    // if (tier) values.tier = tier;
    // status defaults to "Pending Payment"

    const result = await db.insert(members).values(values).returning();

    if (!result || result.length === 0) {
      return res.status(500).json({ error: "Failed to create member" });
    }

    const member = result[0];
    console.log(`✓ Member created: ${member.id}`);
    return res.json({ id: member.id });
  } catch (error: any) {
    console.error("Registration error:", error.message);
    return res.status(500).json({ error: error?.message || "Registration failed" });
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

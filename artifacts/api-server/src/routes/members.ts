import { Router, Request, Response } from "express";
import { db } from "../db.js";
import { members } from "../shared/schema.js";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

// Create member
router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      fullName, phone, email, category, institution, course, yearOfStudy,
      studentNumber, county, subCounty, dateOfBirth, gender,
      nextOfKinName, nextOfKinPhone, skills,
    } = req.body;

    // Validate required fields
    if (!fullName?.trim() || !phone?.trim() || !category || !institution || !county) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log(`[Members] Creating: ${fullName} | ${phone}`);

    // Insert member - only required fields, let DB handle defaults
    const result = await db.insert(members).values({
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email?.trim() || null,
      category,
      institution,
      course: course?.trim() || null,
      yearOfStudy: yearOfStudy?.trim() || null,
      studentNumber: studentNumber?.trim() || null,
      county,
      subCounty: subCounty?.trim() || null,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString().split('T')[0] : null,
      gender: gender || null,
      nextOfKinName: nextOfKinName?.trim() || null,
      nextOfKinPhone: nextOfKinPhone?.trim() || null,
      skills: skills?.trim() || null,
    }).returning();

    if (!result?.length) {
      return res.status(500).json({ error: "Failed to create member" });
    }

    console.log(`[Members] ✓ Created: ${result[0].id}`);
    return res.json({ id: result[0].id, fullName: result[0].fullName });
  } catch (error: any) {
    console.error(`[Members] ✗ Error:`, error.message);
    return res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

// Get all members (admin)
router.get("/", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const rows = await db.select().from(members).orderBy(desc(members.joinedAt));
    return res.json(rows);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message });
  }
});

// Update member status (admin)
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

// Delete member (admin)
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

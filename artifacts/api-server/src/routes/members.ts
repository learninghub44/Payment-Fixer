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
      nextOfKinName, nextOfKinPhone, skills, tier,
    } = req.body;

    console.log(`[Members] Create request body:`, JSON.stringify({
      fullName, phone, category, institution, county, tier
    }));

    // Validate required fields — county is ward in our form
    if (!fullName?.trim()) {
      return res.status(400).json({ error: "Full name is required" });
    }
    if (!phone?.trim()) {
      return res.status(400).json({ error: "Phone number is required" });
    }
    if (!institution?.trim()) {
      return res.status(400).json({ error: "Institution is required" });
    }

    // Insert member
    const result = await db.insert(members).values({
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email?.trim() || null,
      category: category || "Student",
      institution: institution.trim(),
      course: course?.trim() || null,
      yearOfStudy: yearOfStudy?.trim() || null,
      studentNumber: studentNumber?.trim() || null,
      county: county?.trim() || null,       // ward — optional so we don't block registration
      subCounty: subCounty?.trim() || null,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString().split("T")[0] : null,
      gender: gender || null,
      nextOfKinName: nextOfKinName?.trim() || null,
      nextOfKinPhone: nextOfKinPhone?.trim() || null,
      skills: skills?.trim() || null,
      tier: tier || "Member",              // ← was missing before!
    }).returning();

    if (!result?.length) {
      return res.status(500).json({ error: "Database insert returned no rows" });
    }

    console.log(`[Members] ✓ Created member: ${result[0].id} | ${result[0].fullName}`);
    return res.json({ id: result[0].id, fullName: result[0].fullName });

  } catch (error: any) {
    // Return the REAL error message so we can debug
    console.error(`[Members] ✗ Error:`, error.message, error.code);
    return res.status(500).json({
      error: error?.message || "Registration failed. Please try again.",
      code: error?.code,
    });
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

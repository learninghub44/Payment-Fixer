import { Router, Request, Response } from "express";
import { db, pool } from "../db.js";
import { members } from "../shared/schema.js";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

// Ensure tier column exists on every member creation (safe migration)
async function ensureTierColumn() {
  try {
    await pool.query(`ALTER TABLE members ADD COLUMN IF NOT EXISTS tier text DEFAULT 'Member'`);
  } catch { /* already exists */ }
}

// Create member
router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      fullName, phone, email, category, institution, course, yearOfStudy,
      studentNumber, county, subCounty, dateOfBirth, gender,
      nextOfKinName, nextOfKinPhone, skills, tier,
    } = req.body;

    console.log(`[Members] Create:`, { fullName, phone, category, institution, county, tier });

    if (!fullName?.trim()) return res.status(400).json({ error: "Full name is required" });
    if (!phone?.trim())    return res.status(400).json({ error: "Phone number is required" });
    if (!institution?.trim()) return res.status(400).json({ error: "Institution is required" });

    // Use raw SQL to avoid Drizzle schema mismatch with missing columns
    const result = await pool.query(
      `INSERT INTO members
        (full_name, phone, email, category, institution, course, year_of_study,
         student_number, county, sub_county, date_of_birth, gender,
         next_of_kin_name, next_of_kin_phone, skills, tier, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,'Pending Payment')
       RETURNING id, full_name`,
      [
        fullName.trim(),
        phone.trim(),
        email?.trim() || null,
        category || "Student",
        institution.trim(),
        course?.trim() || null,
        yearOfStudy?.trim() || null,
        studentNumber?.trim() || null,
        county?.trim() || null,
        subCounty?.trim() || null,
        dateOfBirth ? new Date(dateOfBirth).toISOString().split("T")[0] : null,
        gender || null,
        nextOfKinName?.trim() || null,
        nextOfKinPhone?.trim() || null,
        skills?.trim() || null,
        tier || "Member",
      ]
    );

    if (!result.rows?.length) {
      return res.status(500).json({ error: "Database insert returned no rows" });
    }

    console.log(`[Members] ✓ Created: ${result.rows[0].id} | ${result.rows[0].full_name}`);
    return res.json({ id: result.rows[0].id, fullName: result.rows[0].full_name });

  } catch (error: any) {
    console.error(`[Members] ✗ Error:`, error.message);
    return res.status(500).json({ error: error?.message || "Registration failed. Please try again." });
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

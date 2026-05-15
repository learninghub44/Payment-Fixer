import { Router, Request, Response } from "express";
import { pool } from "../db.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

// Drop blocking constraints + ensure all columns exist
async function ensureColumns() {
  const sqls = [
    `ALTER TABLE members DROP CONSTRAINT IF EXISTS members_category_check`,
    `ALTER TABLE members DROP CONSTRAINT IF EXISTS members_status_check`,
    `ALTER TABLE members DROP CONSTRAINT IF EXISTS members_tier_check`,
    `ALTER TABLE members ADD COLUMN IF NOT EXISTS tier text DEFAULT 'Member'`,
    `ALTER TABLE members ADD COLUMN IF NOT EXISTS sub_county text`,
    `ALTER TABLE members ADD COLUMN IF NOT EXISTS date_of_birth date`,
    `ALTER TABLE members ADD COLUMN IF NOT EXISTS gender text`,
    `ALTER TABLE members ADD COLUMN IF NOT EXISTS next_of_kin_name text`,
    `ALTER TABLE members ADD COLUMN IF NOT EXISTS next_of_kin_phone text`,
    `ALTER TABLE members ADD COLUMN IF NOT EXISTS skills text`,
    `ALTER TABLE members ADD COLUMN IF NOT EXISTS student_number text`,
  ];
  for (const sql of sqls) {
    try { await pool.query(sql); } catch { /* ignore */ }
  }
}

// Run once on startup
ensureColumns().catch(console.error);

// POST /api/members
router.post("/", async (req: Request, res: Response) => {
  try {
    // Run again to make sure constraints are dropped before each insert
    await ensureColumns();

    const {
      fullName, phone, email, category, institution,
      course, yearOfStudy, studentNumber, county,
      subCounty, dateOfBirth, gender,
      nextOfKinName, nextOfKinPhone, skills, tier,
    } = req.body;

    console.log("[Members] Creating:", { fullName, phone, institution, tier, category });

    if (!fullName?.trim()) return res.status(400).json({ error: "Full name is required" });
    if (!phone?.trim())    return res.status(400).json({ error: "Phone number is required" });
    if (!institution?.trim()) return res.status(400).json({ error: "Institution is required" });

    const { rows } = await pool.query(
      `INSERT INTO members
        (full_name, phone, email, category, institution,
         course, year_of_study, student_number, county,
         sub_county, date_of_birth, gender,
         next_of_kin_name, next_of_kin_phone, skills,
         tier, status)
       VALUES
        ($1,$2,$3,$4,$5,
         $6,$7,$8,$9,
         $10,$11,$12,
         $13,$14,$15,
         $16,'Pending Payment')
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

    if (!rows.length) return res.status(500).json({ error: "No row returned from insert" });

    console.log("[Members] ✓ Created:", rows[0].id);
    return res.json({ id: rows[0].id, fullName: rows[0].full_name });

  } catch (err: any) {
    console.error("[Members] ✗ Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/members — admin only
router.get("/", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM members ORDER BY joined_at DESC`);
    return res.json(rows);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// PATCH /api/members/:id/status
router.patch("/:id/status", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "Status required" });
    await pool.query(`UPDATE members SET status=$1 WHERE id=$2`, [status, req.params.id]);
    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// DELETE /api/members/:id
router.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    await pool.query(`DELETE FROM members WHERE id=$1`, [req.params.id]);
    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

export default router;

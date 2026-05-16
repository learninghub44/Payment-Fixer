import { Router, Request, Response } from "express";
import { pool } from "../db.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

// Ensure table exists
async function ensureTable() {
  await pool.query(`CREATE TABLE IF NOT EXISTS announcements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    body text NOT NULL,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
  )`);
}

router.get("/", async (_req, res) => {
  try {
    await ensureTable();
    const { rows } = await pool.query(`SELECT * FROM announcements ORDER BY created_at DESC`);
    return res.json(rows);
  } catch (e: any) { return res.status(500).json({ error: e.message }); }
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    await ensureTable();
    const { title, body } = req.body;
    if (!title || !body) return res.status(400).json({ error: "Title and body required" });
    const { rows } = await pool.query(
      `INSERT INTO announcements (title, body) VALUES ($1,$2) RETURNING *`, [title, body]
    );
    return res.json(rows[0]);
  } catch (e: any) { return res.status(500).json({ error: e.message }); }
});

router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title || !body) return res.status(400).json({ error: "Title and body required" });
    const { rows } = await pool.query(
      `UPDATE announcements SET title=$1, body=$2, updated_at=now() WHERE id=$3 RETURNING *`,
      [title, body, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    return res.json(rows[0]);
  } catch (e: any) { return res.status(500).json({ error: e.message }); }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `DELETE FROM announcements WHERE id=$1 RETURNING id`, [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    return res.json({ ok: true });
  } catch (e: any) { return res.status(500).json({ error: e.message }); }
});

export default router;

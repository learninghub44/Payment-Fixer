import { Router, Request, Response } from "express";
import { pool } from "../db.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM welfare_campaigns WHERE status='active' ORDER BY created_at DESC`
    );
    return res.json(rows);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.get("/all", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM welfare_campaigns ORDER BY created_at DESC`);
    return res.json(rows);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.post("/", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { title, description, beneficiary, goalAmount } = req.body;
    if (!title || !description) return res.status(400).json({ error: "Title and description required" });
    const { rows } = await pool.query(
      `INSERT INTO welfare_campaigns (title, description, beneficiary, goal_amount, status)
       VALUES ($1,$2,$3,$4,'active') RETURNING *`,
      [title, description, beneficiary || null, Number(goalAmount) || 0]
    );
    return res.json(rows[0]);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.patch("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { title, description, beneficiary, goalAmount } = req.body;
    if (!title || !description) return res.status(400).json({ error: "Title and description required" });
    const { rows } = await pool.query(
      `UPDATE welfare_campaigns SET title=$1, description=$2, beneficiary=$3, goal_amount=$4 WHERE id=$5 RETURNING *`,
      [title, description, beneficiary || null, Number(goalAmount) || 0, req.params.id]
    );
    return res.json(rows[0]);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.patch("/:id/status", requireAdmin, async (req: Request, res: Response) => {
  try {
    await pool.query(`UPDATE welfare_campaigns SET status=$1 WHERE id=$2`, [req.body.status, req.params.id]);
    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    await pool.query(`DELETE FROM welfare_campaigns WHERE id=$1`, [req.params.id]);
    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

export default router;

import { Router, Request, Response } from "express";
import { pool } from "../db.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import multer from "multer";
import { uploadLeaderPhoto } from "../storage.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5_000_000 } });

router.get("/", async (_req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM leaders ORDER BY sort_order ASC`);
    return res.json(rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      position: r.position,
      phone: r.phone,
      photoUrl: r.image_url,
      sortOrder: r.sort_order,
    })));
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.post("/", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, position, phone, sortOrder } = req.body;
    if (!name || !position) return res.status(400).json({ error: "Name and position required" });
    const { rows } = await pool.query(
      `INSERT INTO leaders (name, position, phone, sort_order) VALUES ($1,$2,$3,$4) RETURNING *`,
      [name, position, phone || null, Number(sortOrder) || 0]
    );
    return res.json(rows[0]);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.post("/:id/photo", requireAdmin, upload.single("photo"), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const photoUrl = await uploadLeaderPhoto(req.file.buffer, req.file.originalname, req.file.mimetype);
    await pool.query(`UPDATE leaders SET image_url=$1 WHERE id=$2`, [photoUrl, req.params.id]);
    return res.json({ photoUrl });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

router.patch("/:id/photo", requireAdmin, async (req: Request, res: Response) => {
  try {
    await pool.query(`UPDATE leaders SET image_url=NULL WHERE id=$1`, [req.params.id]);
    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

export default router;

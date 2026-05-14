import { Router, Request, Response } from "express";
import { db } from "../db.js";
import { leaders } from "../shared/schema.js";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "../middleware/requireAdmin.js";
import multer from "multer";
import { uploadLeaderPhoto } from "../storage.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5_000_000 },
});

router.get("/", async (_req: Request, res: Response) => {
  try {
    const rows = await db.select().from(leaders).orderBy(asc(leaders.sortOrder));
    return res.json(rows);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message });
  }
});

router.post("/", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, position, phone, sortOrder } = req.body;
    if (!name || !position) {
      return res.status(400).json({ error: "Name and position required" });
    }

    const result = await db.insert(leaders).values({
      name,
      position,
      phone: phone || null,
      sortOrder: sortOrder ? Number(sortOrder) : 0,
    }).returning();

    if (!result || result.length === 0) {
      return res.status(500).json({ error: "Failed to create leader" });
    }

    return res.json(result[0]);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message });
  }
});

router.post("/:id/photo", requireAdmin, upload.single("photo"), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const photoUrl = await uploadLeaderPhoto(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );
    await db.update(leaders).set({ photoUrl }).where(eq(leaders.id, String(req.params.id)));
    return res.json({ photoUrl });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Upload failed" });
  }
});

router.patch("/:id/photo", requireAdmin, async (req: Request, res: Response) => {
  try {
    await db.update(leaders).set({ photoUrl: null }).where(eq(leaders.id, String(req.params.id)));
    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message });
  }
});

export default router;

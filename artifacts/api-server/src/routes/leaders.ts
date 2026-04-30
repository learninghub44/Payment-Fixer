import { Router, Request, Response } from "express";
import { db } from "../db";
import { leaders } from "../shared/schema";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "../middleware/requireAdmin";
import multer from "multer";
import { uploadLeaderPhoto } from "../storage";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5_000_000 },
});

router.get("/", async (_req: Request, res: Response) => {
  const rows = await db.select().from(leaders).orderBy(asc(leaders.sortOrder));
  return res.json(rows);
});

router.post("/", requireAdmin, async (req: Request, res: Response) => {
  const { name, role, phone, sortOrder } = req.body;
  if (!name || !role) return res.status(400).json({ error: "Name and role required" });
  const [row] = await db.insert(leaders).values({
    name, role, phone: phone || null,
    sortOrder: sortOrder ? Number(sortOrder) : 0,
  }).returning();
  return res.json(row);
});

router.post("/:id/photo", requireAdmin, upload.single("photo"), async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  try {
    const photoUrl = await uploadLeaderPhoto(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );
    await db.update(leaders).set({ photoUrl }).where(eq(leaders.id, String(req.params.id)));
    return res.json({ photoUrl });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Upload failed";
    return res.status(500).json({ error: msg });
  }
});

router.patch("/:id/photo", requireAdmin, async (req: Request, res: Response) => {
  await db.update(leaders).set({ photoUrl: null }).where(eq(leaders.id, String(req.params.id)));
  return res.json({ ok: true });
});

router.patch("/:id", requireAdmin, async (req: Request, res: Response) => {
  const { name, role, phone } = req.body;
  const updates: Record<string, any> = {};
  if (name !== undefined) updates.name = name;
  if (role !== undefined) updates.role = role;
  if (phone !== undefined) updates.phone = phone || null;
  if (Object.keys(updates).length === 0) return res.status(400).json({ error: "No fields to update" });
  const [row] = await db.update(leaders).set(updates).where(eq(leaders.id, String(req.params.id))).returning();
  return res.json(row);
});

router.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
  await db.delete(leaders).where(eq(leaders.id, String(req.params.id)));
  return res.json({ ok: true });
});

export default router;

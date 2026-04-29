import { Router, Request, Response } from "express";
import { db } from "../db";
import { announcements } from "../shared/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const rows = await db.select().from(announcements).orderBy(desc(announcements.createdAt));
  return res.json(rows);
});

router.post("/", requireAdmin, async (req: Request, res: Response) => {
  const { title, body } = req.body;
  if (!title || !body) return res.status(400).json({ error: "Title and body required" });
  const [row] = await db.insert(announcements).values({ title, body }).returning();
  return res.json(row);
});

router.patch("/:id", requireAdmin, async (req: Request, res: Response) => {
  const { title, body } = req.body;
  if (!title || !body) return res.status(400).json({ error: "Title and body required" });
  const [row] = await db.update(announcements)
    .set({ title, body })
    .where(eq(announcements.id, req.params.id))
    .returning();
  return res.json(row);
});

router.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
  await db.delete(announcements).where(eq(announcements.id, req.params.id));
  return res.json({ ok: true });
});

export default router;

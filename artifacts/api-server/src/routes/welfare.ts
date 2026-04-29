import { Router, Request, Response } from "express";
import { db } from "../db";
import { welfareCampaigns } from "../shared/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const rows = await db.select().from(welfareCampaigns)
    .where(eq(welfareCampaigns.status, "active"))
    .orderBy(desc(welfareCampaigns.createdAt));
  return res.json(rows);
});

router.get("/all", requireAdmin, async (_req: Request, res: Response) => {
  const rows = await db.select().from(welfareCampaigns).orderBy(desc(welfareCampaigns.createdAt));
  return res.json(rows);
});

router.post("/", requireAdmin, async (req: Request, res: Response) => {
  const { title, description, beneficiary, goalAmount } = req.body;
  if (!title || !description) return res.status(400).json({ error: "Title and description required" });
  const [row] = await db.insert(welfareCampaigns).values({
    title, description,
    beneficiary: beneficiary || null,
    goalAmount: String(Number(goalAmount) || 0),
    status: "active",
  }).returning();
  return res.json(row);
});

router.patch("/:id", requireAdmin, async (req: Request, res: Response) => {
  const { title, description, beneficiary, goalAmount } = req.body;
  if (!title || !description) return res.status(400).json({ error: "Title and description required" });
  const [row] = await db.update(welfareCampaigns)
    .set({
      title,
      description,
      beneficiary: beneficiary || null,
      goalAmount: String(Number(goalAmount) || 0),
    })
    .where(eq(welfareCampaigns.id, req.params.id))
    .returning();
  return res.json(row);
});

router.patch("/:id/status", requireAdmin, async (req: Request, res: Response) => {
  const { status } = req.body;
  await db.update(welfareCampaigns).set({ status }).where(eq(welfareCampaigns.id, req.params.id));
  return res.json({ ok: true });
});

router.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
  await db.delete(welfareCampaigns).where(eq(welfareCampaigns.id, req.params.id));
  return res.json({ ok: true });
});

export default router;

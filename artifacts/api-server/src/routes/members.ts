import { Router, Request, Response } from "express";
import { db } from "../db";
import { members } from "../shared/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "../middleware/requireAdmin";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const {
    fullName, phone, email, category, institution, course, yearOfStudy,
    studentNumber, county, subCounty, dateOfBirth, gender,
    nextOfKinName, nextOfKinPhone, skills, tier,
  } = req.body;

  if (!fullName || !phone || !category || !institution || !county) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const [member] = await db.insert(members).values({
    fullName,
    phone,
    email: email || null,
    category,
    institution,
    course: course || null,
    yearOfStudy: yearOfStudy || null,
    studentNumber: studentNumber || null,
    county,
    subCounty: subCounty || null,
    dateOfBirth: dateOfBirth || null,
    gender: gender || null,
    nextOfKinName: nextOfKinName || null,
    nextOfKinPhone: nextOfKinPhone || null,
    skills: skills || null,
    tier: tier || "Member",
    status: "Pending Payment",
  }).returning();

  return res.json({ id: member.id });
});

router.get("/", requireAdmin, async (_req: Request, res: Response) => {
  const rows = await db.select().from(members).orderBy(desc(members.joinedAt));
  return res.json(rows);
});

router.patch("/:id/status", requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: "Status required" });
  await db.update(members).set({ status }).where(eq(members.id, String(id)));
  return res.json({ ok: true });
});

router.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  await db.delete(members).where(eq(members.id, String(id)));
  return res.json({ ok: true });
});

export default router;

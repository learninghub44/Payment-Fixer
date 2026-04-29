import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { db } from "../db";
import { adminUsers } from "../shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, email.trim().toLowerCase()));
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  (req.session as any).adminId = user.id;
  (req.session as any).adminEmail = user.email;
  return res.json({ ok: true, email: user.email });
});

router.post("/logout", (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});

router.get("/me", (req: Request, res: Response) => {
  const session = req.session as any;
  if (!session.adminId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  return res.json({ id: session.adminId, email: session.adminEmail });
});

export default router;

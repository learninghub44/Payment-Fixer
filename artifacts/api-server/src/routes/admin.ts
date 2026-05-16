import { Router } from "express";

const router = Router();

// Admin routes placeholder
router.get("/", (req, res) => {
  res.json({ admin: "endpoint" });
});

export default router;

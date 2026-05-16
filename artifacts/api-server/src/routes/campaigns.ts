import { Router } from "express";

const router = Router();

// Get all campaigns
router.get("/", (req, res) => {
  res.json({ campaigns: [] });
});

export default router;

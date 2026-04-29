import { Request, Response, NextFunction } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const session = req.session as any;
  if (!session.adminId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

import { Express, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

export function setupSecurity(app: Express) {
  // Helmet for security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "https://api.pesapal.com", "https://pesapalapi.azurewebsites.net"],
          fontSrc: ["'self'", "https://fonts.googleapis.com"],
          frameSrc: ["https://pesapal.com"],
        },
      },
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      noSniff: true,
      xssFilter: true,
    })
  );

  // CORS
  app.use(
    cors({
      origin: [
        process.env.FRONTEND_URL || "https://kuriaweststudents.pages.dev",
        process.env.APP_BASE_URL || "https://kuwesa-payment-api.onrender.com",
      ],
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // 5 attempts per 15 minutes
    skipSuccessfulRequests: true,
  });

  const paymentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 payments per hour
  });

  app.use("/api/", limiter);
  app.use("/api/member/login", authLimiter);
  app.use("/api/payments/create", paymentLimiter);

  console.log("✓ Security middleware configured");
}

// Request validation middleware
export function validateRequest(req: Request, res: Response, next: NextFunction) {
  // Validate Content-Type for POST/PATCH
  if (["POST", "PATCH"].includes(req.method)) {
    if (!req.is("application/json")) {
      return res.status(400).json({ error: "Content-Type must be application/json" });
    }
  }

  // Sanitize input
  if (typeof req.body === "object" && req.body !== null) {
    for (const key in req.body) {
      if (typeof req.body[key] === "string") {
        req.body[key] = req.body[key].trim().substring(0, 1000);
      }
    }
  }

  next();
}

// Error handling middleware
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error("Error:", err);

  if (err.name === "ValidationError") {
    return res.status(400).json({ error: "Validation failed", details: err.message });
  }

  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
}

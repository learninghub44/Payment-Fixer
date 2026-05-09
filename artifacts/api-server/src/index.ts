import { createApp } from "./app.js";
import { db } from "./db.js";
import { adminUsers, leaders } from "./shared/schema.js";
import bcrypt from "bcryptjs";

async function runSeedIfNeeded() {
  try {
    const existing = await db.select().from(adminUsers);
    if (existing.length === 0) {
      console.log("No admin found — seeding...");
      const hash = await bcrypt.hash("Facebook@2025", 12);
      await db.insert(adminUsers).values({
        email: "kuwesa23@gmail.com",
        username: "kuwesa23",
        fullName: "KUWESA Admin",
        passwordHash: hash,
        role: "admin",
        status: "active",
      }).onConflictDoNothing();
      console.log("✓ Admin created: kuwesa23@gmail.com / Facebook@2025");
      const existingLeaders = await db.select().from(leaders);
      if (existingLeaders.length === 0) {
        await db.insert(leaders).values([
          { name: "AGREY CHACHA", role: "President", phone: "+254745523865", sortOrder: 1 },
          { name: "SHARON ATIEGO", role: "Vice President", phone: null, sortOrder: 2 },
        ]);
        console.log("✓ Default leaders seeded.");
      }
    } else {
      console.log(`✓ Admin already exists — skipping seed.`);
    }
  } catch (e) {
    console.error("Seed error (non-fatal):", e);
  }
}

const app = createApp();
const PORT = Number(process.env.PORT || 10000);

if (!process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`KUWESA server listening on port ${PORT}`);
    const base =
      process.env.APP_BASE_URL ||
      `https://${(process.env.REPLIT_DOMAINS || "").split(",")[0]?.trim() || "localhost"}`;
    console.log(`Pesapal IPN will register against: ${base}/api/payments/ipn`);
    await runSeedIfNeeded();
  });
}

export default app;

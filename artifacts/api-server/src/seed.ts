import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "./db.js";
import { adminUsers, leaders } from "./shared/schema.js";
import { ensureSchema } from "./db.js";

async function seed() {
  console.log("Seeding KUWESA database...");

  await ensureSchema();
  console.log("✓ Schema ensured");

  const hash = await bcrypt.hash("Facebook@2025", 12);
  await db.insert(adminUsers).values({
    email: "kuwesa23@gmail.com",
    username: "kuwesa23",
    fullName: "KUWESA Admin",
    passwordHash: hash,
    role: "admin",
    status: "active",
  }).onConflictDoNothing();
  console.log("✓ Admin ensured: kuwesa23@gmail.com / Facebook@2025");

  const existing = await db.select().from(leaders);
  if (existing.length === 0) {
    await db.insert(leaders).values([
      { name: "AGREY CHACHA",  position: "Founder President", phone: "+254745523865", sortOrder: 1 },
      { name: "SHARON OTAIGO", position: "Vice President",     phone: "+254748207838", sortOrder: 2 },
    ]);
    console.log("✓ Leaders seeded.");
  } else {
    console.log(`✓ Leaders already exist (${existing.length}) — skipping.`);
  }

  console.log("Done.");
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });

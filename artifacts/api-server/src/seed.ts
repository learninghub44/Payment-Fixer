import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "./db.js";
import { adminUsers, leaders } from "./shared/schema.js";
import { ensureSchema } from "./db.js";

async function seed() {
  console.log("Seeding KUWESA database...");

  await ensureSchema();
  console.log("✓ Schema ensured");

  const adminEmail    = process.env.SEED_ADMIN_EMAIL    || "admin@example.com";
  const adminUsername = process.env.SEED_ADMIN_USERNAME || "admin";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error("ERROR: SEED_ADMIN_PASSWORD env var is required. Aborting seed.");
    process.exit(1);
  }

  const hash = await bcrypt.hash(adminPassword, 12);
  await db.insert(adminUsers).values({
    email:        adminEmail,
    username:     adminUsername,
    fullName:     "KUWESA Admin",
    passwordHash: hash,
    role:         "admin",
    status:       "active",
  }).onConflictDoNothing();
  console.log(`✓ Admin ensured: ${adminEmail}`);

  const existing = await db.select().from(leaders);
  if (existing.length === 0) {
    await db.insert(leaders).values([
      { name: "AGREY CHACHA",  position: "Founder President", sortOrder: 1 },
      { name: "SHARON OTAIGO", position: "Vice President",     sortOrder: 2 },
    ]);
    console.log("✓ Leaders seeded.");
  } else {
    console.log(`✓ Leaders already exist (${existing.length}) — skipping.`);
  }

  console.log("Done.");
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });

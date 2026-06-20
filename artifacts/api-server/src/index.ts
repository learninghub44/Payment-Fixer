import "dotenv/config";
import { createApp } from "./app.js";
import { pool } from "./db.js";
import bcrypt from "bcryptjs";

async function seedIfNeeded() {
  try {
    // Ensure admin table exists and seed admin
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email text UNIQUE NOT NULL,
        username text UNIQUE,
        full_name text,
        password_hash text NOT NULL,
        role text DEFAULT 'admin',
        status text DEFAULT 'active',
        created_at timestamp DEFAULT now()
      )
    `);

    const { rows: admins } = await pool.query(`SELECT id FROM admin_users LIMIT 1`);
    if (admins.length === 0) {
      const adminEmail    = process.env.SEED_ADMIN_EMAIL    || "admin@example.com";
      const adminUsername = process.env.SEED_ADMIN_USERNAME || "admin";
      const adminPassword = process.env.SEED_ADMIN_PASSWORD;
      if (!adminPassword) {
        console.warn("⚠ SEED_ADMIN_PASSWORD not set — skipping admin seed. Set it in your environment.");
      } else {
        const hash = await bcrypt.hash(adminPassword, 12);
        await pool.query(
          `INSERT INTO admin_users (email, username, full_name, password_hash, role, status)
           VALUES ($1,$2,$3,$4,'admin','active') ON CONFLICT DO NOTHING`,
          [adminEmail, adminUsername, "KUWESA Admin", hash]
        );
        console.log(`✓ Admin seeded: ${adminEmail}`);
      }
    } else {
      console.log("✓ Admin exists");
    }

    // Ensure leaders table and seed default leaders
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leaders (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        position text,
        phone text,
        image_url text,
        sort_order integer DEFAULT 0,
        created_at timestamp DEFAULT now()
      )
    `);

    const { rows: lRows } = await pool.query(`SELECT id FROM leaders LIMIT 1`);
    if (lRows.length === 0) {
      await pool.query(`
        INSERT INTO leaders (name, position, sort_order) VALUES
        ('AGREY CHACHA', 'Founder President', 1),
        ('SHARON OTAIGO', 'Vice President', 2)
        ON CONFLICT DO NOTHING
      `);
      console.log("✓ Leaders seeded");
    } else {
      console.log(`✓ Leaders exist (${lRows.length})`);
    }
  } catch (e: any) {
    console.error("Seed error:", e.message);
  }
}

const app = createApp();
const PORT = Number(process.env.PORT || 10000);

app.listen(PORT, "0.0.0.0", async () => {
  console.log(`✓ KUWESA API running on port ${PORT}`);
  await seedIfNeeded();
});

export default app;

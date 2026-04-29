import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./shared/schema";

const { Pool } = pg;

const connectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("No database URL found. Set SUPABASE_DATABASE_URL or DATABASE_URL.");
}

export const pool = new Pool({
  connectionString,
  ssl: process.env.SUPABASE_DATABASE_URL ? { rejectUnauthorized: false } : undefined,
});
export const db = drizzle(pool, { schema });

// Idempotent schema migrations — safe to run on every boot.
export async function ensureSchema() {
  const stmts = [
    `ALTER TABLE members ADD COLUMN IF NOT EXISTS tier text DEFAULT 'Member'`,
    `ALTER TABLE leaders ADD COLUMN IF NOT EXISTS phone text`,
    `ALTER TABLE leaders ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0`,
    `ALTER TABLE welfare_campaigns ADD COLUMN IF NOT EXISTS beneficiary text`,
    `ALTER TABLE welfare_campaigns ADD COLUMN IF NOT EXISTS cover_image_url text`,
    `ALTER TABLE members ALTER COLUMN password DROP NOT NULL`,
  ];
  for (const s of stmts) {
    try {
      await pool.query(s);
    } catch {
      // ignore — column may not exist or already nullable
    }
  }
}

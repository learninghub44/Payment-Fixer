import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./shared/schema.js";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const { Pool } = pg;

const connectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString) throw new Error("No database URL. Set SUPABASE_DATABASE_URL.");

export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });

export async function ensureSchema() {
  const creates = [
    `CREATE TABLE IF NOT EXISTS admin_users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      username text NOT NULL,
      email text NOT NULL UNIQUE,
      full_name text NOT NULL,
      password_hash text NOT NULL,
      role text DEFAULT 'admin',
      status text DEFAULT 'active',
      created_at timestamp DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS user_roles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      role text NOT NULL DEFAULT 'admin'
    )`,
    `CREATE TABLE IF NOT EXISTS members (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      full_name text NOT NULL,
      phone text NOT NULL,
      email text,
      category text NOT NULL,
      institution text,
      course text,
      year_of_study text,
      student_number text,
      county text,
      sub_county text,
      date_of_birth date,
      gender text,
      next_of_kin_name text,
      next_of_kin_phone text,
      skills text,
      tier text DEFAULT 'Member',
      status text NOT NULL DEFAULT 'Pending Payment',
      joined_at timestamp DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS announcements (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      title text NOT NULL,
      content text NOT NULL,
      created_at timestamp DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS leaders (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      position text NOT NULL,
      phone text,
      image_url text,
      sort_order integer DEFAULT 0,
      created_at timestamp DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS welfare_campaigns (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      title text NOT NULL,
      description text NOT NULL,
      beneficiary text,
      goal_amount numeric NOT NULL DEFAULT 0,
      raised_amount numeric NOT NULL DEFAULT 0,
      status text NOT NULL DEFAULT 'active',
      cover_image_url text,
      created_at timestamp DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS payments (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      purpose text NOT NULL,
      member_id uuid REFERENCES members(id) ON DELETE SET NULL,
      campaign_id uuid REFERENCES welfare_campaigns(id) ON DELETE SET NULL,
      payer_name text NOT NULL,
      payer_phone text NOT NULL,
      payer_email text,
      amount numeric NOT NULL,
      currency text DEFAULT 'KES',
      merchant_reference text UNIQUE,
      pesapal_tracking_id text,
      pesapal_redirect_url text,
      status text NOT NULL DEFAULT 'PENDING',
      raw_callback jsonb,
      created_at timestamp DEFAULT now(),
      updated_at timestamp DEFAULT now()
    )`,
  ];

  for (const s of creates) {
    try { await pool.query(s); } catch (e: any) { console.error("Create table error:", e.message); }
  }

  // Safe migrations for any missing columns
  const alters = [
    `ALTER TABLE members ADD COLUMN IF NOT EXISTS tier text DEFAULT 'Member'`,
    `ALTER TABLE leaders ADD COLUMN IF NOT EXISTS phone text`,
    `ALTER TABLE leaders ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0`,
    `ALTER TABLE leaders ADD COLUMN IF NOT EXISTS image_url text`,
    `ALTER TABLE welfare_campaigns ADD COLUMN IF NOT EXISTS beneficiary text`,
    `ALTER TABLE welfare_campaigns ADD COLUMN IF NOT EXISTS cover_image_url text`,
    `ALTER TABLE payments ADD COLUMN IF NOT EXISTS merchant_reference text`,
    `ALTER TABLE payments ADD COLUMN IF NOT EXISTS pesapal_tracking_id text`,
    `ALTER TABLE payments ADD COLUMN IF NOT EXISTS pesapal_redirect_url text`,
    `ALTER TABLE payments ADD COLUMN IF NOT EXISTS raw_callback jsonb`,
  ];
  for (const s of alters) {
    try { await pool.query(s); } catch { /* already exists */ }
  }

  console.log("Schema ensured.");
}

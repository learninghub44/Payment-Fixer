import { createClient, SupabaseClient } from "@supabase/supabase-js";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "leader-photos";

let supabase: SupabaseClient | null = null;
function getSupabase(): SupabaseClient | null {
  if (supabase) return supabase;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  supabase = createClient(url, key, { auth: { persistSession: false } });
  return supabase;
}

export function isSupabaseStorageConfigured() {
  return !!getSupabase();
}

export async function uploadLeaderPhoto(
  buffer: Buffer,
  originalName: string,
  mimetype: string
): Promise<string> {
  const ext = path.extname(originalName) || ".jpg";
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;

  const sb = getSupabase();
  if (sb) {
    // Ensure bucket exists (best-effort) and upload publicly readable file.
    try {
      const { data: buckets } = await sb.storage.listBuckets();
      if (!buckets?.some((b) => b.name === BUCKET)) {
        await sb.storage.createBucket(BUCKET, { public: true });
      }
    } catch {
      // ignore — createBucket may fail on permission, upload still works if it exists
    }

    const { error } = await sb.storage
      .from(BUCKET)
      .upload(`leaders/${filename}`, buffer, {
        contentType: mimetype,
        upsert: false,
      });
    if (error) throw new Error(`Supabase upload failed: ${error.message}`);

    const { data } = sb.storage.from(BUCKET).getPublicUrl(`leaders/${filename}`);
    return data.publicUrl;
  }

  // Fallback: local disk (Replit dev only — not Vercel).
  const uploadDir = path.join(process.cwd(), "public", "uploads", "leaders");
  fs.mkdirSync(uploadDir, { recursive: true });
  fs.writeFileSync(path.join(uploadDir, filename), buffer);
  return `/uploads/leaders/${filename}`;
}

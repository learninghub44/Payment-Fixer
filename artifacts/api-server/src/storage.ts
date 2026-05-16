import path from "path";
import crypto from "crypto";

// Safe upload — returns a placeholder URL if Supabase not configured
export async function uploadLeaderPhoto(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<string> {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  const BUCKET       = process.env.SUPABASE_STORAGE_BUCKET || "leader-photos";

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn("[Storage] Supabase not configured — photo upload skipped");
    return ""; // Return empty so fallback photo is used
  }

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const ext      = path.extname(originalName) || ".jpg";
    const fileName = `leader-${crypto.randomUUID()}${ext}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, buffer, { contentType: mimeType, upsert: true });

    if (error) throw error;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
    return data.publicUrl;
  } catch (e: any) {
    console.error("[Storage] Upload failed:", e.message);
    return "";
  }
}

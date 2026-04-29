-- Supabase Storage Policies for leader-photos bucket
-- Run these in Supabase SQL Editor (Project → SQL Editor)

-- 1. Upload Policy - Allow authenticated users to upload files
CREATE POLICY "Allow uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'leader-photos' AND
  auth.role() = 'authenticated'
);

-- 2. Read Policy - Allow public access to view files
CREATE POLICY "Allow public reads" ON storage.objects
FOR SELECT USING (
  bucket_id = 'leader-photos'
);

-- 3. Update Policy - Allow users to update their own files
CREATE POLICY "Allow updates" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'leader-photos' AND
  auth.role() = 'authenticated'
);

-- 4. Delete Policy - Allow users to delete their own files
CREATE POLICY "Allow deletes" ON storage.objects
FOR DELETE USING (
  bucket_id = 'leader-photos' AND
  auth.role() = 'authenticated'
);

-- Optional: Enable RLS (Row Level Security) if not already enabled
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Verify policies are created
SELECT * FROM pg_policies WHERE tablename = 'objects';

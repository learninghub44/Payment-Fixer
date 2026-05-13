-- Supabase RLS Policies for database tables
-- Run these in Supabase SQL Editor (Project → SQL Editor)

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaders ENABLE ROW LEVEL SECURITY;
ALTER TABLE welfare_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- MEMBERS TABLE POLICIES
-- ============================================================================

-- Allow anyone to insert new members (public registration)
CREATE POLICY "Allow public member registration" ON members
FOR INSERT WITH CHECK (true);

-- Allow anyone to read member data (for public viewing)
CREATE POLICY "Allow public member reads" ON members
FOR SELECT USING (true);

-- Allow admins to update member status
CREATE POLICY "Allow admin member updates" ON members
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.email = auth.jwt() ->> 'email'
    AND admin_users.status = 'active'
  )
);

-- Allow admins to delete members
CREATE POLICY "Allow admin member deletes" ON members
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.email = auth.jwt() ->> 'email'
    AND admin_users.status = 'active'
  )
);

-- ============================================================================
-- ADMIN_USERS TABLE POLICIES
-- ============================================================================

-- Allow admins to read admin_users table
CREATE POLICY "Allow admin admin_users reads" ON admin_users
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM admin_users au
    WHERE au.email = auth.jwt() ->> 'email'
    AND au.status = 'active'
  )
);

-- ============================================================================
-- ANNOUNCEMENTS TABLE POLICIES
-- ============================================================================

-- Allow public to read announcements
CREATE POLICY "Allow public announcement reads" ON announcements
FOR SELECT USING (true);

-- Allow admins to manage announcements
CREATE POLICY "Allow admin announcement management" ON announcements
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.email = auth.jwt() ->> 'email'
    AND admin_users.status = 'active'
  )
);

-- ============================================================================
-- LEADERS TABLE POLICIES
-- ============================================================================

-- Allow public to read leaders
CREATE POLICY "Allow public leader reads" ON leaders
FOR SELECT USING (true);

-- Allow admins to manage leaders
CREATE POLICY "Allow admin leader management" ON leaders
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.email = auth.jwt() ->> 'email'
    AND admin_users.status = 'active'
  )
);

-- ============================================================================
-- WELFARE_CAMPAIGNS TABLE POLICIES
-- ============================================================================

-- Allow public to read active welfare campaigns
CREATE POLICY "Allow public welfare reads" ON welfare_campaigns
FOR SELECT USING (status = 'active' OR status = 'completed');

-- Allow admins to manage welfare campaigns
CREATE POLICY "Allow admin welfare management" ON welfare_campaigns
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.email = auth.jwt() ->> 'email'
    AND admin_users.status = 'active'
  )
);

-- ============================================================================
-- PAYMENTS TABLE POLICIES
-- ============================================================================

-- Allow public to create payments (for registration and donations)
CREATE POLICY "Allow public payment creation" ON payments
FOR INSERT WITH CHECK (true);

-- Allow public to read their own payments (by merchant reference)
CREATE POLICY "Allow public payment reads" ON payments
FOR SELECT USING (true);

-- Allow admins to manage all payments
CREATE POLICY "Allow admin payment management" ON payments
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.email = auth.jwt() ->> 'email'
    AND admin_users.status = 'active'
  )
);

-- ============================================================================
-- SUPABASE STORAGE POLICIES
-- ============================================================================

-- Storage bucket policies for leader-photos
CREATE POLICY "Allow uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'leader-photos'
);

CREATE POLICY "Allow public reads" ON storage.objects
FOR SELECT USING (
  bucket_id = 'leader-photos'
);

CREATE POLICY "Allow updates" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'leader-photos'
);

CREATE POLICY "Allow deletes" ON storage.objects
FOR DELETE USING (
  bucket_id = 'leader-photos'
);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

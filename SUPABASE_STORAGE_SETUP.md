# Supabase Storage Bucket Setup Guide

## Create Storage Bucket for Leader Photos

### Step 1: Access Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **"Storage"** in the left sidebar

### Step 2: Create Bucket
1. Click **"New bucket"** button
2. Fill in bucket details:
   - **Name**: `leader-photos`
   - **Public bucket**: **TURN ON** (important!)
   - **File size limit**: Keep default or set as needed
3. Click **"Save"**

### Step 3: Configure Bucket Policies
1. Click on the newly created `leader-photos` bucket
2. Go to **"Settings"** tab
3. Under **"Policies"**, click **"New policy"**
4. Select **"For full customization"** → **"Get started"**

### Step 4: Create Upload Policy
1. **Policy name**: `Allow uploads`
2. **Allowed operation**: `INSERT`
3. **Target roles**: `authenticated` (or `anon` if public uploads needed)
4. **Policy definition**:
```sql
CREATE POLICY "Allow uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'leader-photos' AND
  auth.role() = 'authenticated'
);
```
5. Click **"Save"**

### Step 5: Create Read Policy
1. Click **"New policy"** again
2. **Policy name**: `Allow public reads`
3. **Allowed operation**: `SELECT`
4. **Target roles**: `anon, authenticated`
5. **Policy definition**:
```sql
CREATE POLICY "Allow public reads" ON storage.objects
FOR SELECT USING (
  bucket_id = 'leader-photos'
);
```
6. Click **"Save"**

### Step 6: Update Environment Variables
Make sure these are set in your Render backend service:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_STORAGE_BUCKET=leader-photos
```

### Step 7: Test Upload (Optional)
You can test the bucket by:
1. Going to the bucket in Supabase dashboard
2. Click **"Upload"** to upload a test image
3. Verify the image appears and is publicly accessible

## Important Notes
- **Public bucket must be ON** for frontend to display photos
- **Service role key** is required for server-side uploads
- **Policies** control who can upload/view files
- **Bucket name** must exactly match `leader-photos`

## Troubleshooting
- **Uploads fail**: Check service role key and policies
- **Images not showing**: Ensure bucket is public and read policy exists
- **CORS errors**: May need additional CORS configuration in Supabase

The bucket will be automatically used by the application when leaders upload photos through the admin dashboard.

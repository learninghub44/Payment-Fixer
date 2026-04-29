# Clean Render Deployment Guide

## Updated Service Names (to avoid conflicts)
- **Backend**: `kuwesa-payment-api`
- **Frontend**: `kuwesa-payment-frontend`

## Step 1: Prepare Render Dashboard
1. Go to https://render.com
2. **Delete any existing services** named `kuwesa-api` or `kuwesa-frontend`
3. Click **"New +"** → **"Web Service"**

## Step 2: Deploy Backend Service

### 2.1 Create Backend Service
1. **Connect repository**: `learninghub44/Payment-Fixer`
2. **Name**: `kuwesa-payment-api`
3. **Branch**: `main`
4. **Runtime**: `Node`
5. **Plan**: `Free`

### 2.2 Backend Configuration
```
Build Command: cd artifacts/api-server && cp package-standalone.json package.json && npm install && npm run build
Start Command: cd artifacts/api-server && npm start
Health Check Path: /api/healthz
```

### 2.3 Backend Environment Variables
```
NODE_ENV=production
PORT=10000
SUPABASE_DATABASE_URL=your_supabase_pooler_url_here
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
SUPABASE_STORAGE_BUCKET=leader-photos
SESSION_SECRET=w(Vq[sQq!vFvfFAN}--DJ-B1h9l80}T.
PESAPAL_CONSUMER_KEY=your_pesapal_consumer_key_here
PESAPAL_CONSUMER_SECRET=your_pesapal_consumer_secret_here
PESAPAL_ENV=live
APP_BASE_URL=https://kuwesa-payment-api.onrender.com
```

### 2.4 Deploy Backend
1. Click **"Create Web Service"**
2. Wait for deployment to complete
3. Test: Visit `https://kuwesa-payment-api.onrender.com/api/healthz`

## Step 3: Deploy Frontend Service

### 3.1 Create Frontend Service
1. Click **"New +"** → **"Static Site"**
2. **Connect repository**: Same repository
3. **Name**: `kuwesa-payment-frontend`
4. **Branch**: `main`
5. **Plan**: `Free`

### 3.2 Frontend Configuration
```
Build Command: cd artifacts/relationships && npm install && npm run build
Publish Directory: artifacts/relationships/dist/public
```

### 3.3 Frontend Environment Variables
```
VITE_API_URL=https://kuwesa-payment-api.onrender.com/api
```

### 3.4 Frontend Custom Routes
1. Go to **"Advanced"** section
2. Click **"Add Custom Redirect"**
3. **Source**: `/api/*`
4. **Destination**: `https://kuwesa-payment-api.onrender.com/api/*`
5. **Status**: `200` (Rewrite)

### 3.5 Deploy Frontend
1. Click **"Create Static Site"**
2. Wait for deployment to complete
3. Visit: `https://kuwesa-payment-frontend.onrender.com`

## Step 4: Database Setup
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run the SQL from `supabase-policies.sql`
3. Create the `leader-photos` storage bucket (see `SUPABASE_STORAGE_SETUP.md`)

## Step 5: Post-Deployment Tasks
1. **Update Pesapal IPN**: Set callback to `https://kuwesa-payment-api.onrender.com/api/payments/ipn`
2. **Test admin login**: `kuwesa23@gmail.com` / `Facebook@2025`
3. **Test payment flow**
4. **Test file uploads** (leader photos)

## Final URLs
- **Frontend**: `https://kuwesa-payment-frontend.onrender.com`
- **Backend API**: `https://kuwesa-payment-api.onrender.com/api`
- **Health Check**: `https://kuwesa-payment-api.onrender.com/api/healthz`

## Troubleshooting
- **Build fails**: Check that `package-standalone.json` exists and is being copied correctly
- **Memory issues**: Should be resolved with npm instead of pnpm
- **API not reachable**: Verify custom routes on frontend service
- **Database errors**: Check Supabase credentials and connection strings

## Important Notes
- **Service names are unique** to avoid conflicts
- **npm is used instead of pnpm** to prevent memory issues
- **Standalone package.json** resolves catalog dependency issues
- **Custom routes** proxy API calls from frontend to backend

This clean setup should work without any conflicts from previous deployments.

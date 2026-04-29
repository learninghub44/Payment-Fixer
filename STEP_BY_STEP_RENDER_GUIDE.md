# Step-by-Step Render Deployment Guide

## Overview
You will deploy TWO separate services on Render:
1. **Backend API Service** (kuwesa-api)
2. **Frontend Web Service** (kuwesa-frontend)

## Step 1: Prepare Render Account
1. Go to https://render.com
2. Sign up or login
3. Connect your GitHub account (allow access to repositories)

## Step 2: Deploy Backend Service (kuwesa-api)

### 2.1 Create Backend Service
1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Select **"Connect a repository"**
3. Choose `learninghub44/Payment-Fixer` repository
4. Click **"Connect"**

### 2.2 Configure Backend Service
**Basic Settings:**
- **Name**: `kuwesa-api`
- **Region**: Choose nearest region
- **Branch**: `main`
- **Runtime**: `Node`
- **Build Command**: `pnpm --filter @workspace/api-server install && pnpm --filter @workspace/api-server run build`
- **Start Command**: `pnpm --filter @workspace/api-server run start`

**Advanced Settings:**
- **Instance Type**: `Free` (or paid for better performance)
- **Health Check Path**: `/api/healthz`

### 2.3 Add Backend Environment Variables
In the **"Environment"** section, add these variables:

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
APP_BASE_URL=https://kuwesa-api.onrender.com
```

### 2.4 Deploy Backend
1. Click **"Create Web Service"**
2. Wait for build and deployment to complete
3. Test the API: Visit `https://kuwesa-api.onrender.com/api/healthz`

## Step 3: Deploy Frontend Service (kuwesa-frontend)

### 3.1 Create Frontend Service
1. In Render dashboard, click **"New +"** → **"Static Site"**
2. Select **"Connect a repository"**
3. Choose the same `learninghub44/Payment-Fixer` repository
4. Click **"Connect"**

### 3.2 Configure Frontend Service
**Basic Settings:**
- **Name**: `kuwesa-frontend`
- **Region**: Same region as backend
- **Branch**: `main`
- **Build Command**: `pnpm --filter @workspace/relationships install && pnpm --filter @workspace/relationships run build`
- **Publish Directory**: `artifacts/relationships/dist/public`

### 3.3 Add Frontend Environment Variables
In the **"Environment"** section, add:

```
VITE_API_URL=https://kuwesa-api.onrender.com/api
```

### 3.4 Configure Custom Routes (Important!)
In the **"Advanced"** section, add a **Custom Redirect**:

1. Click **"Add Custom Redirect"**
2. **Source**: `/api/*`
3. **Destination**: `https://kuwesa-api.onrender.com/api/*`
4. **Status**: `200` (Rewrite)

### 3.5 Deploy Frontend
1. Click **"Create Static Site"**
2. Wait for build and deployment to complete
3. Visit your frontend: `https://kuwesa-frontend.onrender.com`

## Step 4: Post-Deployment Setup

### 4.1 Update Pesapal IPN
1. Go to your Pesapal merchant dashboard
2. Update IPN callback URL to: `https://kuwesa-api.onrender.com/api/payments/ipn`

### 4.2 Test Everything
1. **Frontend**: Visit `https://kuwesa-frontend.onrender.com`
2. **API Health**: Visit `https://kuwesa-api.onrender.com/api/healthz`
3. **Admin Login**: Use `kuwesa23@gmail.com` / `Facebook@2025`
4. **Payment Test**: Try making a test payment

## Step 5: Database Setup (if not done)
1. Run database migrations: In Render dashboard, go to backend service → **"Shell"**
2. Run: `cd artifacts/api-server && pnpm run db:push`
3. Run: `cd artifacts/api-server && pnpm run db:seed`

## Important Notes

### Root Directory
- **Both services use the same repository root**
- **No need to change root directories**
- **pnpm workspace commands handle subdirectory navigation**

### Service URLs
- **Backend**: `https://kuwesa-api.onrender.com`
- **Frontend**: `https://kuwesa-frontend.onrender.com`
- **API endpoints**: `https://kuwesa-api.onrender.com/api/*`

### Environment Variables
- **Backend**: All database and payment variables
- **Frontend**: Only API URL variable
- **Session Secret**: Use the generated secret from `session-secret.txt`

## Troubleshooting

### Backend Issues
- Check build logs for pnpm installation errors
- Verify all environment variables are set
- Test health endpoint: `/api/healthz`

### Frontend Issues
- Check if API calls are reaching backend
- Verify VITE_API_URL is correct
- Check custom routes configuration

### Common Problems
- **CORS errors**: Backend needs to allow frontend origin
- **Database connection**: Verify Supabase credentials
- **Payment issues**: Check Pesapal configuration and IPN URL

## Support
- Render dashboard logs for debugging
- GitHub repository for code issues
- Supabase dashboard for database issues
- Pesapal dashboard for payment issues

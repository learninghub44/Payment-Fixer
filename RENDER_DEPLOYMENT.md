# Render Deployment Guide for KUWESA

## Overview
This guide explains how to deploy the KUWESA (Kuria West Students Association) portal to Render.com instead of Vercel.

## Architecture Changes
- **Backend**: Separate Node.js service (Express API)
- **Frontend**: Static site service (React/Vite)
- **Database**: Supabase Postgres (unchanged)

## Deployment Steps

### 1. Prepare Repository
1. Push the repository to GitHub
2. Ensure `render.yaml` is in the root directory

### 2. Backend Service (kuwesa-api)
- **Type**: Web Service
- **Runtime**: Node.js
- **Build Command**: `cd artifacts/api-server && pnpm install && pnpm run build`
- **Start Command**: `cd artifacts/api-server && pnpm run start`
- **Port**: 10000 (Render's default)

### 3. Frontend Service (kuwesa-frontend)
- **Type**: Static Site
- **Build Command**: `cd artifacts/relationships && pnpm install && pnpm run build`
- **Publish Directory**: `artifacts/relationships/dist/public`

### 4. Environment Variables

#### Backend Environment Variables:
```
NODE_ENV=production
PORT=10000
SUPABASE_DATABASE_URL=your_supabase_pooler_url
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_STORAGE_BUCKET=leader-photos
SESSION_SECRET=your_32_char_random_string
PESAPAL_CONSUMER_KEY=your_pesapal_consumer_key
PESAPAL_CONSUMER_SECRET=your_pesapal_consumer_secret
PESAPAL_ENV=live
APP_BASE_URL=https://kuwesa-api.onrender.com
```

#### Frontend Environment Variables:
```
VITE_API_URL=https://kuwesa-api.onrender.com/api
```

### 5. Database Setup
1. Create Supabase project (same as Vercel deployment)
2. Run database migrations: `cd artifacts/api-server && pnpm run db:push`
3. Seed data: `cd artifacts/api-server && pnpm run db:seed`

### 6. Payment Configuration
1. Configure Pesapal IPN callback URL: `https://kuwesa-api.onrender.com/api/payments/ipn`
2. Update Pesapal dashboard with the new callback URL

### 7. Deployment Process
1. Connect your GitHub repository to Render
2. Render will automatically detect `render.yaml`
3. Two services will be created: backend and frontend
4. Monitor deployment logs for any issues

### 8. Post-Deployment
1. Access frontend: `https://kuwesa-frontend.onrender.com`
2. Access API: `https://kuwesa-api.onrender.com/api`
3. Test admin login: `kuwesa23@gmail.com` / `Facebook@2025`
4. Test payment functionality with Pesapal

## Important Notes
- Render uses port 10000 by default for web services
- Frontend will proxy API calls to the backend service
- Ensure CORS is properly configured for cross-origin requests
- Update any hardcoded URLs in the code to use Render URLs
- Monitor logs in Render dashboard for debugging

## Troubleshooting
- Check build logs for dependency installation issues
- Verify environment variables are correctly set
- Ensure database connection is working
- Test API endpoints independently
- Check CORS configuration if frontend can't reach backend

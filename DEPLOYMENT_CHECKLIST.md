# Deployment Checklist

## Pre-Deployment ✅
- [ ] Repository pushed to GitHub
- [ ] Service names updated (`kuwesa-payment-api`, `kuwesa-payment-frontend`)
- [ ] `package-standalone.json` created for backend
- [ ] Session secret generated
- [ ] Supabase project created
- [ ] Pesapal credentials ready

## Backend Deployment ✅
- [ ] Delete old `kuwesa-api` service if exists
- [ ] Create new `kuwesa-payment-api` service
- [ ] Set build command: `cd artifacts/api-server && cp package-standalone.json package.json && npm install && npm run build`
- [ ] Set start command: `cd artifacts/api-server && npm start`
- [ ] Add all environment variables
- [ ] Health check path: `/api/healthz`
- [ ] Deploy successfully
- [ ] Test health endpoint

## Frontend Deployment ✅
- [ ] Delete old `kuwesa-frontend` service if exists
- [ ] Create new `kuwesa-payment-frontend` service
- [ ] Set build command: `cd artifacts/relationships && npm install && npm run build`
- [ ] Set publish directory: `artifacts/relationships/dist/public`
- [ ] Add `VITE_API_URL` environment variable
- [ ] Add custom route: `/api/*` → `https://kuwesa-payment-api.onrender.com/api/*`
- [ ] Deploy successfully
- [ ] Test frontend loads

## Database Setup ✅
- [ ] Run SQL policies from `supabase-policies.sql`
- [ ] Create `leader-photos` storage bucket
- [ ] Set bucket as public
- [ ] Configure upload/read policies
- [ ] Test bucket access

## Post-Deployment ✅
- [ ] Update Pesapal IPN URL: `https://kuwesa-payment-api.onrender.com/api/payments/ipn`
- [ ] Test admin login: `kuwesa23@gmail.com` / `Facebook@2025`
- [ ] Test member registration
- [ ] Test payment flow (small amount)
- [ ] Test leader photo upload
- [ ] Test all frontend pages
- [ ] Test API endpoints directly

## Final URLs 📍
- **Frontend**: https://kuwesa-payment-frontend.onrender.com
- **Backend API**: https://kuwesa-payment-api.onrender.com/api
- **Health Check**: https://kuwesa-payment-api.onrender.com/api/healthz

## Environment Variables Reference 🔧
### Backend
```
NODE_ENV=production
PORT=10000
SUPABASE_DATABASE_URL=your_supabase_pooler_url
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_STORAGE_BUCKET=leader-photos
SESSION_SECRET=w(Vq[sQq!vFvfFAN}--DJ-B1h9l80}T.
PESAPAL_CONSUMER_KEY=your_pesapal_consumer_key
PESAPAL_CONSUMER_SECRET=your_pesapal_consumer_secret
PESAPAL_ENV=live
APP_BASE_URL=https://kuwesa-payment-api.onrender.com
```

### Frontend
```
VITE_API_URL=https://kuwesa-payment-api.onrender.com/api
```

## Troubleshooting Guide 🛠️
- **Build fails**: Check `package-standalone.json` copy command
- **Memory issues**: Should be resolved with npm
- **API not working**: Verify custom routes on frontend
- **Database errors**: Check Supabase credentials
- **Payment issues**: Verify Pesapal configuration
- **Upload issues**: Check storage bucket policies

Follow this checklist step by step for a successful deployment!

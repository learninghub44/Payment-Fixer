# KUWESA — Kuria West Students Association

Full-stack web application for the Kuria West Students Association (KUWESA). Member registration with Pesapal payments, welfare campaigns, announcements, leadership, and an admin dashboard.

## Architecture

pnpm monorepo. Two artifacts in active use:

- `artifacts/relationships` — React + Vite frontend at `/` (named `relationships` for legacy reasons; the artifact title is **KUWESA**).
- `artifacts/api-server` — Express + drizzle-orm REST API at `/api` and static `/uploads`.
- `artifacts/mockup-sandbox` — design template, unused by this product.

Routing is handled by Replit's reverse proxy. The frontend calls `/api/*` and `/uploads/*` directly; the proxy forwards to the API server on port 8080.

## Tech Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind v3, shadcn/ui, react-router-dom v6, @tanstack/react-query, sonner.
- **Backend:** Express 5, drizzle-orm (node-postgres), express-session + connect-pg-simple, multer, bcryptjs, tsx (no build step in dev or prod).
- **Database:** External Supabase Postgres via `SUPABASE_DATABASE_URL` (pooler endpoint).
- **Payments:** Pesapal v3 (live).

## Data model (drizzle, mapped to existing Supabase columns)

- `admin_users` — id, username, email, full_name, password_hash, role, status.
- `members` — full registration fields + `status` ("Pending Payment" | "Paid" | …).
- `announcements` — title, body (mapped to DB column `content`), createdAt.
- `leaders` — name, role (DB `position`), phone, photoUrl (DB `image_url`), sortOrder.
- `welfare_campaigns` — title, description, beneficiary, goal_amount, raised_amount, status, cover_image_url.
- `payments` — Pesapal order tracking + raw_callback jsonb.

The Supabase schema was richer than the app's drizzle schema. We aligned by:
1. Aliasing TS field names to actual DB column names (e.g. `body → content`, `role → position`, `photoUrl → image_url`).
2. Non-destructive `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` for missing columns (`leaders.phone`, `leaders.sort_order`, `welfare_campaigns.beneficiary`, `welfare_campaigns.cover_image_url`).
3. Made `members.password` nullable with empty default (registration doesn't collect a password).

## Routes

Frontend (`react-router-dom`):
- `/` — Marketing site (Hero, About, Programs, Leadership, Membership, Welfare, Contact).
- `/admin` — admin login.
- `/admin/dashboard` — admin dashboard.
- `/payment/success`, `/payment/failed` — Pesapal callbacks.

API (`/api/*`):
- `auth/login`, `auth/logout`, `auth/me`
- `members` (POST public, GET/PATCH/DELETE admin-only)
- `announcements` (GET public, mutations admin-only)
- `leaders` (GET public, mutations + photo upload admin-only)
- `welfare` (GET public, mutations admin-only)
- `payments/create`, `payments/ipn`, `payments/status`
- `healthz`

## Admin credentials (seeded)
- Email: `kuwesa23@gmail.com`
- Password: `Facebook@2025`

(Existing Supabase admin `kuwesa12@gmail.com` is also present from a previous deployment.)

## Environment / Secrets

Required Replit Secrets (already set):
- `SUPABASE_DATABASE_URL`
- `PESAPAL_CONSUMER_KEY`, `PESAPAL_CONSUMER_SECRET`, `PESAPAL_IPN_ID`
- `SESSION_SECRET` (Replit auto-generates)

Optional:
- `PESAPAL_ENV` — defaults to `live`.
- `APP_BASE_URL` — defaults to the request host; useful when callbacks need an explicit URL.

## Workflows

- `artifacts/relationships: web` → `pnpm --filter @workspace/relationships run dev` (Vite, port 25104).
- `artifacts/api-server: API Server` → `pnpm --filter @workspace/api-server run dev` (tsx watch, port 8080).
- `artifacts/mockup-sandbox: Component Preview Server` — unused.

## Useful commands

```bash
pnpm --filter @workspace/api-server run db:seed     # seed admin + default leaders
pnpm --filter @workspace/api-server run typecheck   # typecheck server
pnpm --filter @workspace/relationships run typecheck # typecheck frontend
```

## Deployment notes

Production build: the API runs via `tsx src/index.ts` (no esbuild bundle); the frontend is built statically by Vite and served from `dist/public`. Both are wired in `.replit-artifact/artifact.toml` for each artifact. Make sure all four secrets are set in the production environment before publishing.

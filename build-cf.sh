#!/bin/bash
set -e
echo "=== Cloudflare Pages Build ==="
echo "Node: $(node --version)"
echo "pnpm: $(pnpm --version)"

# Install deps for the relationships package only
cd artifacts/relationships
cp package-standalone.json package.json 2>/dev/null || true
pnpm install --no-frozen-lockfile 2>/dev/null || npm install --legacy-peer-deps

# Build
npx vite build --config vite.config.render.ts
echo "=== Build complete ==="

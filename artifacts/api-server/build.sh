#!/bin/bash
set -e

echo "=== KUWESA API Build ==="

cp package-standalone.json package.json
echo "✓ Copied package-standalone.json"

npm install --legacy-peer-deps
echo "✓ Dependencies installed"

npm run build
echo "✓ TypeScript compiled"

npm run db:seed
echo "✓ Database seeded"
echo "=== Build complete ==="

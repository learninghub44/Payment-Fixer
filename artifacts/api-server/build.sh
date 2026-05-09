#!/bin/bash
set -e

echo "=== KUWESA API Build ==="

# Copy standalone package.json (no workspace catalog deps)
cp package-standalone.json package.json
echo "✓ Copied package-standalone.json"

# Install dependencies
npm install --legacy-peer-deps
echo "✓ Dependencies installed"

# Compile TypeScript
npm run build
echo "✓ TypeScript compiled"

# Seed the database (creates admin user + default data)
echo "Seeding database..."
npm run db:seed || echo "Seed skipped (may already be seeded)"

echo "=== Build complete ==="

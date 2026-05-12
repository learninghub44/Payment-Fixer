#!/bin/bash
set -e

echo "=== KUWESA API Build ==="

cp package-standalone.json package.json
echo "✓ Copied package-standalone.json"

npm install --legacy-peer-deps
echo "✓ Dependencies installed"

# Clean old dist to force full recompile
rm -rf dist
npm run build
echo "✓ TypeScript compiled"

echo "=== Build complete ==="

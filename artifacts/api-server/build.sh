#!/bin/bash
set -e

echo "Starting build process..."

# Copy standalone package.json
cp package-standalone.json package.json

# Install dependencies
echo "Installing dependencies..."
npm install

# Install TypeScript type definitions
echo "Installing TypeScript type definitions..."
npm install @types/express @types/cors @types/express-session @types/multer @types/connect-pg-simple @types/node @types/pg @types/bcryptjs drizzle-kit typescript

# Build the project
echo "Building TypeScript project..."
npm run build

echo "Build completed successfully!"

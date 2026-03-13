#!/bin/bash
# Render Build Script — Lot Ops Pro (lotopspro.io)
set -e

echo "📦 [Render] Lot Ops Pro build starting..."

# Install ALL deps (devDependencies needed for tsx, vite, esbuild, etc.)
echo "📚 Installing dependencies..."
NODE_ENV=development npm install --legacy-peer-deps || npm install --force

# Build client + server
echo "🔧 Building application..."
npm run build

echo "✅ [Render] Lot Ops Pro build complete!"

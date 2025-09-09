#!/bin/bash

echo "🚀 Cleaning old dependencies..."
rm -rf node_modules
rm -f package-lock.json

echo "📦 Installing dependencies with legacy peer deps..."
npm install --legacy-peer-deps

echo "⚡ Building React app..."
npm run build

echo "✅ Build completed successfully!"

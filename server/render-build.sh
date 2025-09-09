#!/bin/bash
echo "Cleaning node_modules and lock files..."
rm -rf node_modules
rm -f package-lock.json

echo "Installing dependencies with clean cache..."
npm cache clean --force
npm install --no-audit --no-fund

echo "Build completed successfully!"
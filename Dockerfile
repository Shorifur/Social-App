# Use Node.js 18
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy server package files
COPY server/package*.json ./server/

# Install server dependencies
RUN npm ci --prefix ./server --only=production --no-audit --no-fund

# Copy server source code
COPY server/ ./server

# Copy client build (if exists)
COPY client/build ./client/build

# Create uploads folder
RUN mkdir -p /app/server/uploads

# Expose server port
EXPOSE 5000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start the server
CMD ["node", "server/server.js"]

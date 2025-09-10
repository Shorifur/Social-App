# Use Node.js 18 Alpine
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy server package files
COPY server/package*.json ./

# Install dependencies (production only)
RUN npm ci --only=production --no-audit --no-fund

# Copy server source code
COPY server/ .

# Copy React build (make sure you've already run `npm run build` inside client)
COPY client/build ./client/build

# Create uploads folder
RUN mkdir -p uploads

# Expose backend port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start server
CMD ["npm", "start"]

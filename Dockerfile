FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy only server package files
COPY server/package*.json ./

# Install dependencies (production only)
RUN npm ci --only=production --no-audit --no-fund

# Copy the server source code
COPY server/ .

# Create uploads directory (in container)
RUN mkdir -p uploads

# Expose backend port
EXPOSE 10000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:10000/api/health || exit 1

# Start backend
CMD ["npm", "start"]

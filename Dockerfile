FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY server/package*.json ./

# Install dependencies
RUN npm ci --only=production --no-audit --no-fund

# Copy source code
COPY server/ .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 10000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:10000/api/health || exit 1

# Start the application
CMD ["npm", "start"]
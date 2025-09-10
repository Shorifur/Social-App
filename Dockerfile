# === BUILD STAGE ===
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies for client
COPY client/package*.json ./client/
RUN cd client && npm ci

# Build frontend
COPY client/ ./client
RUN cd client && npm run build

# Install dependencies for server
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production

# Copy server code
COPY server/ ./server

# === PRODUCTION IMAGE ===
FROM node:18-alpine

WORKDIR /app

# Copy server code
COPY --from=builder /app/server ./server

# Copy client build into server
COPY --from=builder /app/client/build ./server/client/build

# Set working directory
WORKDIR /app/server

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "start"]

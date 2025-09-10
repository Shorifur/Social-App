# Stage 1: Build React app
FROM node:18-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Build backend image
FROM node:18-alpine
WORKDIR /app

# Copy server package.json and install dependencies
COPY server/package*.json ./
RUN npm ci --only=production

# Copy server source code
COPY server/ ./

# Copy React build from previous stage
COPY --from=client-build /app/client/build ./client/build

# Create uploads folder
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Start backend server
CMD ["node", "server.js"]

# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies first to leverage cache
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Setup production dependencies
FROM node:20-alpine AS production-deps

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

# Stage 3: Create the final image
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Copy necessary files from build stages
COPY --from=production-deps /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

# Copy other necessary files (optional, depending on your app needs)
# COPY --from=builder /usr/src/app/package.json ./

# Set environment
ENV NODE_ENV=production

# Expose the application port
EXPOSE 3005

# Start the application
CMD ["node", "dist/main"]

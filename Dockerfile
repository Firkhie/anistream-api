# Stage 1: Build TypeScript
FROM node:22-alpine AS builder

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install build dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source and TypeScript configuration
COPY tsconfig.json ./
COPY src ./src

# Compile TypeScript to dist/
RUN pnpm run build

# Stage 2: Production Runtime
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install only production dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Copy compiled JavaScript from builder
COPY --from=builder /app/dist ./dist

# Run as non-root user for security
USER node

EXPOSE 3000

# Start server directly
CMD ["node", "dist/src/index.js"]

# ─── Stage 1: Builder ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies needed for native modules (bcrypt, sharp, etc.)
RUN apk add --no-cache python3 make g++ libc6-compat

# Copy package files and install ALL dependencies (including devDeps for build)
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the NestJS app
RUN yarn build

# ─── Stage 2: Production Runner ────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Install dependencies needed at runtime (sharp, bcrypt need native libs)
RUN apk add --no-cache libc6-compat

# Copy package files and install PRODUCTION dependencies only
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

# Copy built output from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy static assets and keys
COPY public ./public
COPY prisma ./prisma
COPY private.pem public.pem ./

# Expose the app port (set via PORT env variable)
EXPOSE ${PORT:-3000}

# Run database migrations then start the app
CMD ["sh", "-c", "npx prisma migrate deploy && node -r tsconfig-paths/register dist/main"]

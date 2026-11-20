# ── Stage 1: Build the React/Vite frontend ────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Install frontend deps
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ── Stage 2: Production server ─────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

# Copy Express server
COPY server/ ./server/

# Install server deps
WORKDIR /app/server
RUN npm install --omit=dev

# Copy built frontend from Stage 1
WORKDIR /app
COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["node", "server/index.js"]

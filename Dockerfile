# syntax=docker/dockerfile:1

# ---- Frontend build ----
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm ci

# copy configs so Tailwind works
COPY tsconfig.json ./
COPY postcss.config.mjs ./

# copy frontend source
COPY src ./src
COPY public ./public

RUN npm run build

# ---- Backend build ----
FROM node:20-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend ./

# ---- Runner ----
FROM node:20-alpine AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# frontend
COPY --from=frontend-build /app/.next ./.next
COPY --from=frontend-build /app/public ./public
COPY --from=frontend-build /app/node_modules ./node_modules
COPY package*.json ./
COPY tsconfig.json ./
COPY postcss.config.mjs ./

# backend
COPY --from=backend-build /app/backend ./backend

EXPOSE 3000 3001

CMD ["sh", "-c", "cd /app/backend && npm run start & cd /app && npm run start"]

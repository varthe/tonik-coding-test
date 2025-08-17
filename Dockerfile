# ------------------------
# Frontend build stage
# ------------------------
FROM node:20-alpine AS frontend-build

WORKDIR /app

# Build-time argument for socket URL
ARG NEXT_PUBLIC_SOCKET_URL
ENV NEXT_PUBLIC_SOCKET_URL=${NEXT_PUBLIC_SOCKET_URL}

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy config and sources
COPY tsconfig.json ./
COPY src ./src
COPY public ./public

# Build Next.js app
RUN npm run build


# ------------------------
# Backend build stage
# ------------------------
FROM node:20-alpine AS backend-build

WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm ci

COPY backend ./backend


# ------------------------
# Runner stage
# ------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Copy frontend build artifacts
COPY --from=frontend-build /app/.next ./.next
COPY --from=frontend-build /app/public ./public
COPY --from=frontend-build /app/node_modules ./node_modules
COPY package*.json ./
COPY tsconfig.json ./

# Copy backend
COPY --from=backend-build /app/backend ./backend

EXPOSE 3000 3001

# Run both frontend (Next.js) and backend
CMD ["sh", "-c", "node backend/server.js & npm start"]

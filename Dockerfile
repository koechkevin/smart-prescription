FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json package-lock.json* ./
COPY packages/server/package.json packages/server/
COPY packages/react/package.json packages/react/
COPY packages/widget/package.json packages/widget/
RUN npm install

# Build React frontend (SPA mode)
FROM deps AS frontend
COPY packages/react/ packages/react/
COPY tsconfig.base.json ./
RUN cd packages/react && npx vite build --config vite.config.app.ts

# Build server
FROM deps AS server-build
COPY packages/server/ packages/server/
COPY tsconfig.base.json ./
RUN cd packages/server && npx prisma generate && npx tsc

# Production image
FROM node:20-alpine AS production
WORKDIR /app

COPY package.json package-lock.json* ./
COPY packages/server/package.json packages/server/
COPY packages/react/package.json packages/react/
COPY packages/widget/package.json packages/widget/
RUN npm install --omit=dev

# Copy Prisma schema + migrations for runtime migrate
COPY packages/server/prisma packages/server/prisma/
RUN cd packages/server && npx prisma generate

# Copy compiled server
COPY --from=server-build /app/packages/server/dist packages/server/dist/

# Copy frontend build into server's public directory
COPY --from=frontend /app/packages/react/dist-app packages/server/public/

# Entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "packages/server/dist/index.js"]

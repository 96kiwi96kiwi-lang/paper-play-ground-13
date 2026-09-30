# Paper-first production image.
# Do not bake API keys. Default mode is paper; live still requires server env +
# Trade-only audit + typed ENABLE LIVE, and resets to paper on restart.
# Mount a volume at /app/data for worker-lease.json and bot-state.json.

FROM node:22-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && mkdir -p /app/data

COPY --from=build /app/.output ./.output

EXPOSE 3000

# Credential-free start. Host may inject KUCOIN_* later; never invent them here.
CMD ["node", ".output/server/index.mjs"]

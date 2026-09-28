# 24/7 paper worker — no npm install of the full app, no Vite build.
FROM node:22-bookworm-slim

WORKDIR /app

COPY worker/index.mjs ./worker/index.mjs

ENV NODE_ENV=production
ENV HOST=0.0.0.0

# Railway injects PORT
EXPOSE 3000

CMD ["node", "worker/index.mjs"]

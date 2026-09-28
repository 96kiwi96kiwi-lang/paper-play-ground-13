FROM node:22-bookworm-slim

WORKDIR /app

# Install deps first (better layer cache)
COPY package.json package-lock.json* ./ 
RUN npm install

COPY . .

ENV NODE_ENV=production
ENV NITRO_PRESET=node-server

RUN npm run build

# Railway sets PORT
ENV HOST=0.0.0.0
EXPOSE 3000

CMD ["npm", "run", "start"]

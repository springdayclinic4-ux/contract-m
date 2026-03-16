FROM node:20-slim

RUN apt-get update && apt-get install -y openssl python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/package*.json ./
RUN npm install --production

COPY backend/ ./
RUN npx prisma generate

EXPOSE 3001

CMD ["node", "src/server.js"]

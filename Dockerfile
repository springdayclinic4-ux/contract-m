FROM node:20-slim

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/package*.json ./
RUN npm install

COPY backend/ ./
RUN npx prisma generate

EXPOSE ${PORT:-3001}

CMD ["npm", "start"]

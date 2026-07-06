FROM node:20-slim

WORKDIR /app

# O Prisma precisa do OpenSSL disponível no sistema para funcionar corretamente.
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

# Cria/atualiza as tabelas no banco a partir do schema, e só então inicia o servidor.
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npm run start"]

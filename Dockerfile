FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

# Aplica as migrações do banco de dados e só então inicia o servidor.
# Assim, toda vez que o container sobe, o banco fica sempre atualizado.
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]

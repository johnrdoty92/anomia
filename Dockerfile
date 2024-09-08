FROM node:lts-alpine AS base
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
WORKDIR /app
RUN apk update && apk upgrade
RUN apk add --no-cache sqlite
COPY package*.json ./
COPY server/package.json /app/server/package.json
COPY client/package.json /app/client/package.json
RUN npm install
COPY . .
RUN npx prisma migrate reset --force --schema=./server/prisma/schema.prisma
RUN npx prisma db seed --schema=./server/prisma/schema.prisma
RUN chown -R node /app
USER node
CMD ["npm", "run", "test"]
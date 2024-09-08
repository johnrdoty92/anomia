FROM node:lts-alpine AS base
ARG DATABASE_URL=${DATABASE_URL}
RUN apk update && apk upgrade
RUN apk add --no-cache sqlite
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma migrate dev --name init
RUN npx prisma db seed
RUN chown -R node /app
USER node

FROM base as dev
CMD ["npm", "start"]

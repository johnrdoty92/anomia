FROM node:lts-alpine AS base
RUN apk update && apk upgrade
RUN apk add --no-cache sqlite
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma migrate dev
RUN chown -R node /app
USER node

FROM base as dev
CMD ["npm", "start"]

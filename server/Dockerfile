FROM node:lts-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN chown -R node /app
USER node

FROM base as dev
CMD ["npm", "start"]

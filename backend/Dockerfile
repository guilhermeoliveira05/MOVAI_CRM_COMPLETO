FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

RUN mkdir -p uploads/properties database

EXPOSE 3001

CMD ["node", "server.js"]

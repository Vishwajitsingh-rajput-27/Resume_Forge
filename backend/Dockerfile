FROM node:18-alpine
RUN apk add --no-cache dumb-init
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
EXPOSE 5000
ENTRYPOINT ["dumb-init","--"]
CMD ["node","server.js"]

FROM node:18-alpine
RUN apk add --no-cache dumb-init
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
ENTRYPOINT ["dumb-init","--"]
CMD ["node","server.js"]

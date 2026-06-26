FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY server.js rate_calculator.cjs ./
EXPOSE 8080
CMD ["node", "server.js"]

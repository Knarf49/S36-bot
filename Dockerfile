FROM node:22-alpine
WORKDIR /app
RUN apk add --no-cache cairo pango jpeg giflib librsvg
COPY package*.json ./
RUN npm ci --omit=dev
COPY server.js rate_calculator.cjs promptpay_qr.cjs ./
COPY promptpay_logo.jpg Thai_QR_Payment_Logo.png Mitr-Regular.ttf ./
EXPOSE 8080
CMD ["node", "server.js"]

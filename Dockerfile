
FROM node:18-alpine

WORKDIR /app


COPY package*.json ./
COPY prisma ./prisma/


RUN npm ci --only=production

RUN npx prisma generate

# Copy source code
COPY src ./src/

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "src/server.js"]

# Dockerfile for Railway deployment
FROM node:20-slim

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Build the frontend
RUN npm run build

# Create persistent uploads directory
RUN mkdir -p /data/uploads

# Railway injects PORT automatically
ENV PORT=3011
ENV NODE_ENV=production
ENV UPLOADS_DIR=/data/uploads

EXPOSE ${PORT}

CMD ["npm", "start"]

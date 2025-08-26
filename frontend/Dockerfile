# Build stage
FROM node:24-alpine AS build
WORKDIR /app

# Copy package files for better layer caching
COPY package.json package-lock.json* ./

# Install dependencies with error handling for peer dependency conflicts
RUN npm ci --legacy-peer-deps --ignore-scripts || \
    npm install --legacy-peer-deps --ignore-scripts

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_URL=http://localhost:8080
ARG VITE_SIGNALR_URL=http://localhost:8080

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SIGNALR_URL=$VITE_SIGNALR_URL

# Build the application
RUN npm run build

# Development stage
FROM nginx:alpine AS development

# Install curl for health checks
RUN apk add --no-cache curl

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx.dev.conf /etc/nginx/conf.d/default.conf

# Copy built application
COPY --from=build /app/dist /usr/share/nginx/html

# Create health check endpoint
RUN echo '{"status":"ok"}' > /usr/share/nginx/html/health

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

EXPOSE 80

# Production stage (default)
FROM development AS production

# Copy production nginx config
COPY nginx.prod.conf /etc/nginx/conf.d/default.conf

# Production optimizations
RUN rm -rf /var/cache/apk/*

# Security headers and optimizations are handled in nginx.prod.conf
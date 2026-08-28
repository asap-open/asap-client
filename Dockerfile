# Stage 1: Build the application
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the application (creates /app/dist)
RUN yarn build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# VITE_BACKEND_SERVER_URL is NOT used by the compiled JavaScript.
# The JS always calls /api (relative), and Nginx proxies it to the backend.
# This variable is injected at runtime via `docker run -e` or compose environment:
# it is consumed by nginx.conf.template via envsubst when the container starts.

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx template configuration for envsubst
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
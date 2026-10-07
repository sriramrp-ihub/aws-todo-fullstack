
#  Build stage
FROM node:18-alpine AS builder

WORKDIR /app


COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies 
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript to JavaScript
RUN npm run build

#  Production stage
FROM node:18-alpine

WORKDIR /app


COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy compiled JavaScript from builder
COPY --from=builder /app/dist ./dist



#  port exposed
EXPOSE 8008

CMD ["node", "dist/server.js"]

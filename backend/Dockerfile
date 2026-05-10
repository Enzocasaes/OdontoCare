# Build stage
FROM node:20 AS builder

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install all dependencies (skip scripts to avoid native build issues)
RUN npm install --ignore-scripts

# Copy source code and prisma schema
COPY backend/src ./src
COPY backend/prisma ./prisma

# Generate Prisma Client explicitly
RUN npx prisma generate

# Production stage
FROM node:20

WORKDIR /app

# Copy package files for reference
COPY backend/package*.json ./

# Copy node_modules from builder (already has all dependencies)
COPY --from=builder /app/node_modules /app/node_modules

# Copy generated Prisma client
COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma

# Copy source code and configuration
COPY backend/src ./src
COPY backend/prisma ./prisma
COPY backend/.env* ./

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/api', (r) => {if (r.statusCode !== 401) throw new Error(r.statusCode)})"

# Start the application
CMD ["npm", "start"]

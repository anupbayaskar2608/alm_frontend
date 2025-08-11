# ---------- Stage 1: Install Dependencies ----------
FROM node:20-slim AS base
WORKDIR /app

# Copy only package files for dependency install
COPY package*.json ./

# Install all dependencies (including dev for testing)
RUN npm ci && npm cache clean --force

# ---------- Stage 2: Copy Source & Run ----------
FROM node:20-slim
WORKDIR /app

# Copy node_modules from base image
COPY --from=base /app/node_modules ./node_modules

# Copy source code
COPY . .

# Set environment variables
ENV PORT=3000
ENV NODE_ENV=development

# Expose port
EXPOSE 3000

# Use npm start (works because npm exists here)
CMD ["npm", "start"]
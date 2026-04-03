# Dockerfile for Backend Deployment
# This file is placed at the repository root for platforms like Render

FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy backend package files
COPY confession-app/backend/package*.json ./

# Install dependencies
RUN npm install --production

# Copy backend source code
COPY confession-app/backend/ ./

# Expose port
EXPOSE 5000

# Set production environment by default
ENV NODE_ENV=production

# Start the application
CMD ["node", "src/server.js"]

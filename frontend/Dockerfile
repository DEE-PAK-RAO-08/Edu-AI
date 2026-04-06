FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Install a production Express server
RUN npm install express

# Expose the port
EXPOSE 5173

# Start the application using server.js
CMD ["node", "server.js"]

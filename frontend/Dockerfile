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

# Show the dist folder contents for debugging
RUN ls -la dist

# Expose the standard port
EXPOSE 5173

# Start the application using node server.js
CMD ["node", "server.js"]

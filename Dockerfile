# Use official Node.js 22 image
FROM node:22

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if present)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose the port (change if your app uses a different port)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
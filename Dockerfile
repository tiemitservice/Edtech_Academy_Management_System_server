# Dockerfile

# Use a lightweight version of Node.js
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of your application code into the container
COPY . .

# Tell Docker that your app runs on port 5000
EXPOSE 5000

# The command to start your application
CMD ["node", "server.js"]
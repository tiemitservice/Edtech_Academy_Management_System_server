# Use Node.js official image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps


# Copy the rest of the app
COPY . .



# Expose the app on port 4000
EXPOSE 3000

# Command to run the app
CMD ["npm", "start"]

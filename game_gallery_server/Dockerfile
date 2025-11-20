# Use an official Node.js runtime
FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app code
COPY . .

# Vite runs on port 5173
EXPOSE 5173

# Run the "dev" script and expose it
# We add "--host 0.0.0.0" so it's accessible outside the container
CMD [ "npm", "run", "dev", "--", "--host", "0.0.0.0" ]
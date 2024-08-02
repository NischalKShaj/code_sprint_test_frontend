# Use the official Node.js image to build the application
FROM node:18-alpine as build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the Next.js application
RUN npm run build
# RUN npm run export

# Use the official Nginx image to serve the static files
FROM nginx:1.23-alpine

# Remove the default Nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy the build output to Nginx's static files directory
COPY --from=build /app/out /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Command to run Nginx
CMD ["nginx", "-g", "daemon off;"]

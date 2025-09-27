# # Stage 1: Build the Vite app
# FROM node:18-alpine AS build

# WORKDIR /app

# # Install dependencies
# COPY package*.json ./
# RUN npm install

# # Copy source code and build
# COPY . .
# RUN npm run build


# Stage 2: Serve with nginx
FROM nginx:alpine

# *** CHANGE IS HERE: Copy the dist directory from the build context ***
# You are now relying on the file being present on the runner's disk.
COPY frontend/dist /usr/share/nginx/html 

# Copy custom nginx config if needed (optional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

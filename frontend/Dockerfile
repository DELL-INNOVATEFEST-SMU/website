# # Stage 1: Build the Vite app
# FROM node:18-alpine AS build

# WORKDIR /app

# # Install dependencies
# COPY package*.json ./
# RUN npm install

# # Copy source code and build
# COPY . .
# RUN npm run build


# Stage 1 removed since build happens in workflow
FROM nginx:alpine

# Copy prebuilt assets (dist/) into nginx html folder
COPY dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

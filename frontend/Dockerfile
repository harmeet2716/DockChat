# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps
COPY . ./
# This will build the production-ready static files
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
# Copy the built files from the previous stage
COPY --from=build /app/build /usr/share/nginx/html
# Add custom nginx config to handle React Router (SPA)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

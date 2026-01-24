# Building stage
# Base image
FROM node:18 AS build

# Working directory
WORKDIR /app

# copy packagejson
COPY package*.json ./
# clean install
RUN npm ci

COPY . .

# Build the code.
RUN npm run build

# Serve stage (for ngixn)
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

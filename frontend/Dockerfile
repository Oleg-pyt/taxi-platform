# Build stage
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./

# Provide local file dependency path used by package.json:
# @benatti/api -> file:../api/target/generated-sources/ts
RUN mkdir -p /api/target/generated-sources
COPY --from=api /app/target/generated-sources/ts /api/target/generated-sources/ts

RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:stable-alpine
COPY --from=build /app/dist/frontend /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

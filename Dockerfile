FROM node:20-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html

RUN printf 'server {\n    listen 3000;\n    root /usr/share/nginx/html;\n    location / {\n        try_files $uri /index.html;\n    }\n}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 3000

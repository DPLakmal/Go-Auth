FROM node:24-alpine AS build
WORKDIR /app

ARG NG_APP_API_BASE_URL=http://localhost:8080/api/v1
ENV NG_APP_API_BASE_URL=$NG_APP_API_BASE_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build:prod

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/go-auth/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

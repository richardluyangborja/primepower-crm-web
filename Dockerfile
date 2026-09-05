FROM node:24-alpine AS build

ARG VITE_API_URL

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Create .env from the Docker build argument
RUN echo "VITE_API_URL=$VITE_API_URL" > .env

RUN cat .env

RUN npm run build

# ---- runtime stage ----
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/templates/default.conf.template

CMD ["nginx", "-g", "daemon off;"]

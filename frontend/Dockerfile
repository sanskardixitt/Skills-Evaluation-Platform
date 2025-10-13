
FROM node:18-alpine as builder

WORKDIR /app


COPY package*.json ./


RUN npm ci


COPY . .


RUN npm run build


FROM nginx:alpine


COPY --from=builder /app/dist /usr/share/nginx/html


EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# Etapa 1: Build (Compilación)
FROM node:20-alpine AS build

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de configuración y dependencias
COPY package.json package-lock.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código
COPY . .

ARG API_HOST
ARG API_PORT
ARG API_BASE
ARG API_PROTOCOL

ENV VITE_API_HOST=$API_HOST
ENV VITE_API_PORT=$API_PORT
ENV VITE_API_BASE=$API_BASE
ENV VITE_API_PROTOCOL=$API_PROTOCOL

# Genera los archivos estáticos de producción
RUN npm run build

# Etapa 2: Runtime (Servir con Nginx)
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY ./nginx.conf /etc/nginx/nginx.conf

COPY --from=build /app/dist /usr/share/nginx/html

# El puerto 80 es el puerto por defecto de Nginx
EXPOSE 80
EXPOSE 443

# Nginx se inicia automáticamente
CMD ["nginx", "-g", "daemon off;"]

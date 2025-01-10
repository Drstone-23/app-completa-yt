FROM node:16

WORKDIR /app

# 1. Copiamos e instalamos dependencias
COPY package.json package-lock.json ./
RUN npm install

# 2. Copiamos el resto del proyecto
COPY . .

# 3. Construimos la app (React) para producción
RUN npm run build

# 4. Exponemos el puerto 3000 (opcional si vas a usar 'serve')
EXPOSE 3000

RUN npm install -g serve

# 5. Servimos la app generada en build/
CMD ["serve", "-s", "build", "-l", "3000"]

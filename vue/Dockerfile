FROM node:20-bullseye

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Installer serve
RUN npm install -g serve

# Utiliser le port de Render (10000 par défaut) ou 5173 en fallback
CMD ["serve", "-s", "dist", "-l", "${PORT:-5173}"]
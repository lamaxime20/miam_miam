FROM node:20-bullseye

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

RUN npm install -g serve

# Utiliser directement le port 10000 (standard Render)
CMD ["serve", "-s", "dist", "-l", "10000"]
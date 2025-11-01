# Étape 1 : Image de base avec Node.js
FROM node:20-bullseye

# Étape 2 : Définir le répertoire de travail
WORKDIR /app

# Étape 3 : Copier les fichiers de configuration
COPY package*.json ./

# Étape 4 : Installer les dépendances
RUN npm install

# Étape 5 : Copier le reste du code
COPY . .

# Étape 6 : Build de production
RUN npm run build

# Étape 7 : Installer un serveur HTTP simple pour servir les fichiers static
RUN npm install -g serve

# Étape 8 : Exposer le port
EXPOSE 5173

# Étape 9 : Servir les fichiers built
CMD ["serve", "-s", "dist", "-l", "5173"]
# Étape 1 : Image de base avec Node.js
FROM node:20-bullseye

# Étape 2 : Définir le répertoire de travail
WORKDIR /app

# Étape 3 : Copier les fichiers de configuration
COPY package-lock.json ./
COPY package.json ./

# Étape 4 : Installer les dépendances
RUN npm install

# Étape 5 : Copier le reste du code
COPY . .

# Étape 6 : Exposer le port utilisé par Vite
EXPOSE 5173

# Étape 7 : Démarrer le serveur Vite
CMD ["npm", "run", "dev", "--", "--host"]
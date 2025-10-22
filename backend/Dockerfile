# Étape 1 : Image de base PHP avec extensions nécessaires
FROM php:8.2-fpm

# Étape 2 : Installer les dépendances système nécessaires
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql

# Étape 3 : Installer Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Étape 4 : Créer le répertoire de travail
WORKDIR /var/www/html

# Étape 5 : Copier le contenu du projet
COPY . .

# Étape 6 : Installer les dépendances PHP
RUN composer install --no-interaction --prefer-dist --optimize-autoloader

# Étape 7 : Donner les droits à Laravel sur les dossiers de cache
RUN chown -R www-data:www-data storage bootstrap/cache

# Étape 8 : Exposer le port du serveur
EXPOSE 8000

# Étape 9 : Commande de démarrage
CMD php artisan serve --host=0.0.0.0 --port=8000
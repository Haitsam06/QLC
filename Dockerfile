# ==========================================
# STAGE 1: Build Frontend Assets
# ==========================================
FROM node:20-alpine AS node_build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ==========================================
# STAGE 2: Build Final PHP + Nginx Container
# ==========================================
FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    nginx \
    libpng-dev \
    libjpeg-dev \
    libwebp-dev \
    libfreetype6-dev \
    zip \
    unzip \
    git \
    curl \
    libssl-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install gd bcmath

# Install PHP MongoDB Extension
RUN pecl install mongodb && docker-php-ext-enable mongodb

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . .

# Copy built React assets from Node stage
COPY --from=node_build /app/public/build /var/www/html/public/build

# Install Composer PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Configure Nginx
COPY docker/nginx.conf /etc/nginx/sites-available/default
# Link it to sites-enabled if not already
RUN ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# Adjust directory permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Expose port
EXPOSE 8080

# Make entrypoint script executable
RUN chmod +x docker/entrypoint.sh

# Run startup script
ENTRYPOINT ["docker/entrypoint.sh"]

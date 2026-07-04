#!/sh

# Cache configurations
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations (force)
php artisan migrate --force

# Start PHP-FPM in background
php-fpm -D

# Start Nginx in foreground
nginx -g "daemon off;"

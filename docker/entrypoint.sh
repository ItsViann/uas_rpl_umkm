#!/bin/sh
set -e

# Generate application key if not set
if [ -z "$APP_KEY" ]; then
    echo "Generating app key..."
    php artisan key:generate --force
fi

# Run migrations if database is configured
if [ -n "$DB_HOST" ] || [ -n "$DATABASE_URL" ]; then
    echo "Running migrations..."
    php artisan migrate --force
fi

# Cache config, routes, and views
echo "Optimizing application cache..."
php artisan optimize

# Run supervisord
exec supervisord -c /etc/supervisor/conf.d/supervisord.conf


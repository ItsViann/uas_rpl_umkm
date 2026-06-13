#!/bin/sh
set -e

# Run migrations if database is configured
if [ -n "$DB_HOST" ] || [ -n "$DATABASE_URL" ]; then
    echo "Running migrations..."
    php artisan migrate --force
fi

# Run supervisord
exec supervisord -c /etc/supervisor/conf.d/supervisord.conf

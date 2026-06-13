#!/bin/sh
set -e

# Generate application key if not set
if [ -z "$APP_KEY" ]; then
    echo "Generating app key..."
    php artisan key:generate --force
fi

# Run migrations if database is configured
if [ -n "$DB_HOST" ] || [ -n "$DATABASE_URL" ] || [ -n "$DB_URL" ] || [ -n "$MYSQLHOST" ] || [ -n "$MYSQL_URL" ] || [ -n "$DB_DATABASE" ]; then
    echo "Running migrations..."
    php artisan migrate --force

    # Check if database is empty (users count is 0)
    USER_COUNT=$(php artisan tinker --execute="echo App\Models\User::count();" 2>/dev/null || echo "0")
    if [ "$USER_COUNT" = "0" ] || [ -z "$USER_COUNT" ]; then
        echo "Database is empty. Running database seeder..."
        php artisan db:seed --force
    else
        echo "Database already has records ($USER_COUNT users). Skipping seeder."
    fi
fi

# Cache config, routes, and views
echo "Optimizing application cache..."
php artisan optimize

# Run supervisord
exec supervisord -c /etc/supervisor/conf.d/supervisord.conf


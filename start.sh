#!/bin/sh
set -e
./codestylefix.sh

echo "Resetting database..."
php artisan migrate:fresh --seed

echo "Starting Laravel server at http://127.0.0.1:8000"
php -S 127.0.0.1:8000 -t public

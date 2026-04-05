#!/usr/bin/env sh
cp .env.example .env;
composer install;
php artisan key:generate;
./start.sh

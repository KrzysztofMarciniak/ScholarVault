#!/bin/sh
composer csf app/* routes/* database/migrations/* database/seeders/* database/factories/* bootstrap/*.php 

php artisan migrate:fresh --seed
php -S 127.0.0.1:8000 -t public

#!/bin/sh
./codestylefix.sh

php artisan migrate:fresh --seed
php -S 127.0.0.1:8000 -t public

FROM php:8.3-cli 

RUN apt-get update 
RUN apt-get install -y libpq-dev 
RUN docker-php-ext-install pdo pdo_pgsql 

WORKDIR /var/www/html

CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"] 
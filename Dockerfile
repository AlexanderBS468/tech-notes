FROM php:8.0-cli

WORKDIR /app

COPY public ./public
COPY src ./src
COPY storage ./storage

EXPOSE 8080

CMD ["php", "-S", "0.0.0.0:8080", "-t", "public"]

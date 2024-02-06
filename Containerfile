
FROM nginx

COPY ./index.html /usr/share/nginx/html
COPY ./index.css /usr/share/nginx/html
COPY ./dest/ /usr/share/nginx/html/

EXPOSE 80

FROM nginx
RUN rm /etc/nginx/conf.d/default.conf
COPY build /usr/share/nginx/html
COPY nginx_conf /etc/nginx/conf.d
VOLUME /var/log/nginx
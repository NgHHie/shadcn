FROM nginx:alpine

WORKDIR /usr/share/nginx/html

COPY build /usr/share/nginx/html

COPY nginx/web.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

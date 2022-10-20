FROM alpine:3.14

# Install bash and Docker.
RUN apk update && apk add bash curl
RUN apk add --update docker openrc
RUN rc-update add docker boot

# Run the entrypoint script.
COPY ./docker-entrypoint.sh /usr/local/bin/pmc-entrypoint.sh
RUN chmod 755 /usr/local/bin/pmc-entrypoint.sh
WORKDIR "/"
ENTRYPOINT ["/usr/local/bin/pmc-entrypoint.sh"]
CMD ["echo", "If this printed, then something went wrong..."]

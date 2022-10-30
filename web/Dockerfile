FROM --platform=linux/amd64 httpd:2.4

# Add the URL to access the backend.
ENV REACT_APP_API_ENDPOINT="http://<HOSTNAME>:18877/api/"

# Copy the source code of the website into the container.
COPY ./ ./src/

# Install NPM.
RUN apt-get update && \
    apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_current.x | bash -
RUN apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Build the website.
ENV BUILD_PATH="/usr/local/apache2/htdocs/"
RUN cd src && npm install -y && npm run build

# Copy in the Apache configurations.
COPY apache-httpd.conf /usr/local/apache2/conf/httpd.conf
COPY apache-htaccess /usr/local/apache2/htdocs/.htaccess

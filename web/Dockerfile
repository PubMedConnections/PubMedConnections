FROM node:13.12.0-alpine

# set working directory
WORKDIR /web

# add `/app/node_modules/.bin` to $PATH
ENV PATH /web/node_modules/.bin:$PATH
ENV REACT_APP_API_ENDPOINT="http://0.0.0.0:8080/api/"

# install app dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install --silent

# add app
COPY . ./

# start app
CMD ["npm", "start"]
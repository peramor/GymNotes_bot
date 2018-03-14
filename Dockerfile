FROM node:8-alpine

# Create app folder
RUN mkdir -p /usr/src/app

# Set PWD to the app folder
WORKDIR /usr/src/app

# copy package description
COPY package.json /usr/src/app/

# Install all dependencies
RUN yarn

# Bundle app source
COPY . /usr/src/app

EXPOSE 3000
CMD [ "yarn", "start" ]
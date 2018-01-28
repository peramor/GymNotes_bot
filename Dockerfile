FROM node:8-alpine

# Create app folder
RUN mkdir -p /usr/src/app

# Set PWD to the app folder
WORKDIR /usr/src/app

# copy package description
COPY package.json /usr/src/app/
# copy npm register
COPY .yarnrc /usr/src/app/

# Install all dependencies
RUN yarn

# Bundle app source
COPY . /usr/src/app

EXPOSE 8081
CMD [ "yarn", "start" ]
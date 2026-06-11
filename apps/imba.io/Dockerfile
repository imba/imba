FROM node:10

WORKDIR /usr/src/app

COPY package.json ./

RUN yarn

COPY . .

EXPOSE 3011
CMD [ "yarn", "run", "start"]

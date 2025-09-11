FROM node:lts-alpine

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install
COPY . .

EXPOSE 4172

CMD ["npm", "run", "dev"]


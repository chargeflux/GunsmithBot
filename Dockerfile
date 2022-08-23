FROM node:16

USER node
WORKDIR /home/node/app
COPY package*.json .
RUN npm ci
COPY . .

CMD ["npm", "start"]
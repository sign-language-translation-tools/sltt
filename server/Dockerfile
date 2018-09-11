FROM node:8
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY src ./src
COPY index.js ./

EXPOSE 3001
CMD ["npm", "start"]
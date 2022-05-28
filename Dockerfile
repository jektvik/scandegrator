FROM node:14-bullseye

WORKDIR /usr/src/app

# Bundle app source
RUN apt update -y
RUN apt install nasm -y
RUN apt install python2 -y

COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

EXPOSE 8080

ENTRYPOINT ["npm", "run", "start"]
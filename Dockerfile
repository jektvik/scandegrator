FROM node:14-bullseye

WORKDIR /usr/src/app
COPY package*.json ./

# Bundle app source
COPY . .

RUN apt update -y
RUN apt install nasm -y
RUN npm ci --only=production
RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "start"]
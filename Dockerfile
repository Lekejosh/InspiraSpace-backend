FROM node:alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 8080
CMD ["pm2", "start", "server.js","-i","max"]
# CMD [ "npm","run","dev" ]
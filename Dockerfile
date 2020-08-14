FROM node:14
WORKDIR /usr/src/app
COPY . .
RUN npm install
EXPOSE 3000
CMD [ "node", "server/app.js" ]
CMD tail -f /dev/null
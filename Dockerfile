FROM node:14
WORKDIR /usr/src/app
COPY . .
RUN git clone https://github.com/acmesh-official/acme.sh.git
RUN apt-get update \
 && apt-get install -y sudo
RUN cd ./acme.sh \
 && chmod 755 acme.sh \
 && ./acme.sh --install --force
RUN npm install
EXPOSE 3000
CMD [ "node", "server/app.js" ]
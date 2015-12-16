FROM node:5.1.1-onbuild

RUN apt-get update
RUN apt-get install unzip
RUN cd /usr/local/bin && wget https://www.browserstack.com/browserstack-local/BrowserStackLocal-linux-x64.zip && unzip BrowserStackLocal-linux-x64.zip && chmod +x BrowserStackLocal && rm BrowserStackLocal-linux-x64.zip
ADD . /usr/src/app

WORKDIR /usr/src/app

CMD [ "node", "server.js" ]

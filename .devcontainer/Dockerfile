FROM ubuntu:18.04

WORKDIR /home/

COPY . .

ENV NODE_VERSION=lts
RUN apt-get update
RUN apt-get install -y curl
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use lts
RUN . "$NVM_DIR/nvm.sh" && nvm alias default lts
RUN node --version
RUN npm --version

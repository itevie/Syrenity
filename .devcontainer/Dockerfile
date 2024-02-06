FROM ubuntu:18.04

WORKDIR /home/

COPY . .

ENV NODE_VERSION=lts
RUN apt-get update
RUN apt-get install -y curl
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
ENV NVM_DIR=/root/.nvm

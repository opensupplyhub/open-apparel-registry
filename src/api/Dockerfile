FROM node:8-slim

RUN mkdir -p /usr/local/src
WORKDIR /usr/local/src

COPY ./package.json ./yarn.lock /usr/local/src/

RUN set -ex \
	&& yarn install \
	&& yarn cache clean

COPY . /usr/local/src

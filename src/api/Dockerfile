FROM node:8-slim

RUN set -ex \
	&& apt-get update \
	&& apt-get install -y --no-install-recommends \
		python \
	&& rm -rf /var/lib/apt/lists/*

RUN mkdir -p /usr/local/src
WORKDIR /usr/local/src

COPY ./package.json ./yarn.lock /usr/local/src/

RUN set -ex \
	&& yarn install \
	&& yarn cache clean

COPY . /usr/local/src

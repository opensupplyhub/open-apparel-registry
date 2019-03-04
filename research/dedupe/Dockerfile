FROM python:3.7-slim-stretch

RUN mkdir -p /usr/local/src
WORKDIR /usr/local/src

COPY requirements.txt /usr/local/src/

RUN set -ex \
    && buildDeps=" \
    build-essential \
    " \
    && apt-get update && apt-get install -y $buildDeps --no-install-recommends \
    && pip install --no-cache-dir -r requirements.txt \
    && apt-get purge -y --auto-remove $buildDeps

COPY . /usr/local/src

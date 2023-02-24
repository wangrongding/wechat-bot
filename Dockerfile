ARG APT_SOURCE="default"

FROM node:19 as builder-default
ENV NPM_REGISTRY="https://registry.npmjs.org"

FROM node:19 as builder-aliyun

ENV NPM_REGISTRY="https://registry.npmmirror.com"
RUN sed -i s/deb.debian.org/mirrors.aliyun.com/g /etc/apt/sources.list \
    && ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo 'Asia/Shanghai' >/etc/timezone

FROM builder-${APT_SOURCE} AS builder
# Instal the 'apt-utils' package to solve the error 'debconf: delaying package configuration, since apt-utils is not installed'
# https://peteris.rocks/blog/quiet-and-unattended-installation-with-apt-get/
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    apt-utils \
    autoconf \
    automake \
    bash \
    build-essential \
    ca-certificates \
    chromium \
    coreutils \
    curl \
    ffmpeg \
    figlet \
    git \
    gnupg2 \
    jq \
    libgconf-2-4 \
    libtool \
    libxtst6 \
    moreutils \
    python-dev \
    shellcheck \
    sudo \
    tzdata \
    vim \
    wget \
  && apt-get purge --auto-remove \
  && rm -rf /tmp/* /var/lib/apt/lists/*

FROM builder

ENV CHROME_BIN="/usr/bin/chromium" \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"

RUN mkdir -p /app
WORKDIR /app

COPY package.json ./
RUN npm config set registry ${NPM_REGISTRY} && npm i

COPY *.js ./
COPY src/ ./src/

CMD ["npm", "run", "dev"]

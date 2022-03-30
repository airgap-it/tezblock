FROM node:16.13.0 as angular-build

# See https://crbug.com/795759
RUN apt-get update && apt-get install -yq libgconf-2-4 bzip2 build-essential
RUN apt-get install -yq git

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.
RUN apt-get update && apt-get install -y wget --no-install-recommends \
	&& wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
	&& sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
	&& apt-get update \
	&& apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst \
	--no-install-recommends --allow-unauthenticated \
	&& rm -rf /var/lib/apt/lists/* \
	&& apt-get purge --auto-remove -y curl \
	&& rm -rf /src/*.deb

RUN mkdir /app
WORKDIR /app

# install dependencies
ADD .npmrc /app/.npmrc
ADD package.json /app/package.json
ADD yarn.lock /app/yarn.lock
COPY ./scripts /app/scripts

ARG FONTAWESOME_NPM_AUTH_TOKEN

ARG MAINNET_RPC_URL 
ARG ITHACANET_RPC_URL
ARG MAINNET_CONSEIL_URL 
ARG ITHACANET_CONSEIL_URL
ARG MAINNET_CONSEIL_API_KEY 
ARG ITHACANET_CONSEIL_API_KEY
ARG MAINNET_TARGET_URL
ARG ITHACANET_TARGET_URL
ARG GA_KEY

RUN yarn config set unsafe-perm true
RUN yarn set-env
RUN yarn install --frozen-lockfile

ENV NODE_ENV production

# copy src
COPY . /app/

# post-install hook, to be safe if it got cached
RUN node config/patch_crypto.js

# compile to check for errors
RUN yarn build:prod

###################################

FROM nginx:1-alpine

COPY --from=angular-build /app/dist/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD [ "nginx", "-g", "daemon off;" ]

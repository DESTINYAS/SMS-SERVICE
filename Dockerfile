# Common build stage
FROM node:14.14.0-alpine3.12 as common-build-stage

COPY . /usr/boosta/sms-service

WORKDIR /usr/boosta/sms-service

RUN npm install

# Development build stage
FROM common-build-stage as development-build-stage

ENV NODE_ENV development

# Production build stage
FROM common-build-stage as production-build-stage

ENV NODE_ENV production
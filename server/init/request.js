'use strict';

const request = require('request');

const config = require(`${global.__base}/server/config/config`);
const logger = require(`${global.__base}/server/utilities/modules/utilLogger`);
const wrapRequest = require(`${global.__base}/server/lib/zipkin/zipkin-instrumentation-request`);
const {
  getZipkinTracer
} = require(`${global.__base}/server/lib/zipkin/zipkin-setup`);

module.exports = (remoteServiceName) => {
  logger.info('SERVICE', 'Initializing Request');

  const tracer = getZipkinTracer(
    config.zipkin.recorderType,
    config.app.applicationService,
    config.zipkin.remoteHttp
  );

  return wrapRequest(request, tracer, remoteServiceName);
};

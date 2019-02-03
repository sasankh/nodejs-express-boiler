'use strict';

const request = require('request');
const wrapRequest = require('zipkin-instrumentation-request');

const config = require(`${global.__base}/server/config/config`);

const {
  getZipkinTracer
} = require(`${global.__base}/server/init/zipkin`);

const zipkinTracer = getZipkinTracer(
  config.zipkin.recorderType,
  config.app.applicationService,
  config.zipkin.remoteHttp
);

module.exports.getRequest = (remoteServiceName) => {
  return wrapRequest(request, {
    tracer: zipkinTracer,
    remoteServiceName
  });
};

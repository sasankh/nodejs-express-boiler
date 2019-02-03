'use strict';

const zipkinMiddleware = require('zipkin-instrumentation-express').expressMiddleware;

const {
  getZipkinTracer
} = require(`${global.__base}/server/lib/zipkin/zipkin-setup`);

module.exports.zipkinMiddleware = (type, localServiceName, endpoint) => {
  const tracer = getZipkinTracer(type, localServiceName, endpoint);

  return zipkinMiddleware({ tracer });
};

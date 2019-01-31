'use strict';

const zipkinMiddleware = require('zipkin-instrumentation-express').expressMiddleware;

const {
  getZipkinTracer
} = require(`${global.__base}/server/init/zipkin`);

module.exports.zipkinMiddleware = (type, localServiceName, endpoint) => {
  const tracer = getZipkinTracer(type, localServiceName, endpoint);

  return zipkinMiddleware({ tracer });
};

'use strict';

const wrapRequest = require('zipkin-instrumentation-request');

module.exports = (request, tracer, remoteServiceName) => {
  return wrapRequest(request, {
    tracer,
    remoteServiceName
  });
};

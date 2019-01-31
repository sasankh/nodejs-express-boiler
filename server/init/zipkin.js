'use strict';

const validator = require('validator');
const {
  Tracer,
  ExplicitContext,
  ConsoleRecorder,
  BatchRecorder,
  jsonEncoder: { JSON_V2 }
} = require('zipkin');
const CLSContext = require('zipkin-context-cls');
const { HttpLogger } = require('zipkin-transport-http');

const {
  logger
} = require(`${global.__base}/server/utilities`);

function zipkinConsoleTracer(serviceName) {
  logger.info('SERVICE', 'Initializing zipkin local console tracer');

  let localServiceName = 'NOT_AVAILABLE';

  if (serviceName) {
    localServiceName = serviceName.trim();
  } else {
    logger.warn('SERVICE', 'Service Name missing', serviceName);
  }

  const ctxImpl = new ExplicitContext();
  const recorder = new ConsoleRecorder();
  const tracer = new Tracer({
    ctxImpl,
    recorder,
    localServiceName
  });

  return tracer;
}

function zipkinHttpTransportTracer(serviceName, endpoint) {
  logger.info('SERVICE', 'Initializing zipkin remote http tracer');

  let localServiceName = 'NOT_AVAILABLE';

  if (serviceName) {
    localServiceName = serviceName.trim();
  } else {
    logger.warn('SERVICE', 'Service Name missing', serviceName);
  }

  let returnTracer;

  if (
    endpoint
    && validator.isURL(endpoint, { require_tld: false })
  ) {
    const ctxImpl = new CLSContext('zipkin');
    const recorder = new BatchRecorder({
      logger: new HttpLogger({
        endpoint: endpoint.trim(),
        jsonEncoder: JSON_V2
      })
    });

    const tracer = new Tracer({
      ctxImpl,
      recorder,
      localServiceName
    });

    returnTracer = tracer;
  } else {
    logger.warn('SERVICE', 'Not a valid endpoint. Proceeding to zipkin local console tracer instead', endpoint);
    returnTracer = zipkinConsoleTracer(localServiceName);
  }

  return returnTracer;
}

module.exports.getZipkinTracer = (type, localServiceName, endpoint) => {
  switch (type) {
  case 'http':
    return zipkinHttpTransportTracer(localServiceName, endpoint);

  case 'console':
  default:
    return zipkinConsoleTracer(localServiceName);
  }
};

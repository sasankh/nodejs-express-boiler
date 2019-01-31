'use strict';

const validator = require('validator');
const {
  Tracer,
  ExplicitContext,
  ConsoleRecorder,
  BatchRecorder,
  jsonEncoder: { JSON_V2 }
} = require('zipkin');
const zipkinMiddleware = require('zipkin-instrumentation-express').expressMiddleware;
const CLSContext = require('zipkin-context-cls');
const { HttpLogger } = require('zipkin-transport-http');

const {
  logger
} = require(`${global.__base}/server/utilities`);

function zipkinConsoleMiddleware(serviceName) {
  logger.info('SERVICE', 'Initializing zipkin local console');

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

  return zipkinMiddleware({ tracer });
}

function zipkinHttpTransportMiddleware(serviceName, endpoint) {
  logger.info('SERVICE', 'Initializing zipkin remote http');

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

    returnTracer = zipkinMiddleware({ tracer });
  } else {
    logger.warn('SERVICE', 'Not a valid endpoint. Initializing zipkin local console instead', endpoint);
    returnTracer = zipkinConsoleMiddleware(localServiceName);
  }

  return returnTracer;
}

module.exports.zipkinMiddleware = (type, localServiceName, endpoint) => {
  switch (type) {
  case 'http':
    return zipkinHttpTransportMiddleware(localServiceName, endpoint);

  case 'console':
  default:
    return zipkinConsoleMiddleware(localServiceName);
  }
};

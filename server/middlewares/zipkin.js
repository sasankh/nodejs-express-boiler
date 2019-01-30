'use strict';

const {
  Tracer,
  ExplicitContext,
  ConsoleRecorder,
  BatchRecorder,
  jsonEncoder: {JSON_V2}
} = require('zipkin');
const zipkinMiddleware = require('zipkin-instrumentation-express').expressMiddleware;
const CLSContext = require('zipkin-context-cls');
const { HttpLogger } = require('zipkin-transport-http');

const config = require(`${global.__base}/server/config/config`);

// const {
//   logger
// } = require(`${global.__base}/server/utilities`);

module.exports.zipkinMiddleware = () => {
  const ctxImpl = new ExplicitContext();
  const recorder = new ConsoleRecorder();
  const localServiceName = config.app.applicationService;
  const tracer = new Tracer({
    ctxImpl,
    recorder,
    localServiceName
  });

  return zipkinMiddleware({ tracer });
};

module.exports.zipkinMiddleware2 = ({}) => {
  const ctxImpl = new CLSContext('zipkin');
  const recorder = new BatchRecorder({
    logger: new HttpLogger({
      endpoint: 'http://localhost:9411/api/v2/spans',
      jsonEncoder: JSON_V2
    })
  });
  const localServiceName = config.app.applicationService;

  const tracer = new Tracer({
    ctxImpl,
    recorder,
    localServiceName
  });

  return zipkinMiddleware({ tracer });
};

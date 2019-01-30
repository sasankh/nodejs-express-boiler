'use strict';

const {
  addRequestId
} = require('./addRequestId');

const {
  parseAccessOrigin,
  cors,
  accessControlAllow
} = require('./cors');

const {
  zipkinMiddleware,
  zipkinMiddleware2
} = require('./zipkin');

module.exports = {
  addRequestId,
  parseAccessOrigin,
  cors,
  accessControlAllow,
  zipkinMiddleware,
  zipkinMiddleware2
};

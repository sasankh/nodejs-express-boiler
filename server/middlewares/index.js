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
  zipkinMiddleware
} = require('./zipkin');

module.exports = {
  addRequestId,
  parseAccessOrigin,
  cors,
  accessControlAllow,
  zipkinMiddleware
};

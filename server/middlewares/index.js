'use strict';

const {
  addRequestId
} = require('./addRequestId');

const {
  parseAccessOrigin,
  cors,
  accessControlAllow
} = require('./cors');

module.exports = {
  addRequestId,
  parseAccessOrigin,
  cors,
  accessControlAllow
};

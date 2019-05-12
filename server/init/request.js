'use strict';

const request = require('request');

const config = require(`${global.__base}/server/config/config`);
const logger = require(`${global.__base}/server/utilities/modules/utilLogger`);

module.exports = (remoteServiceName) => {
  logger.info('SERVICE', 'Initializing Request');

  return request;
};

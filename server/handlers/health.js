'use strict';

const config = require(`${global.__base}/server/config/config`);

const {
  logger,
  response
} = require(`${global.__base}/server/utilities`);

module.exports.home = (req, res) => {
  logger.requestRest(req, 'home', req.body);

  response.success(req.requestId, {
    service: true,
    message: config.app.applicationService
  }, res);
};

module.exports.basicHealthCheck = (req, res) => {
  logger.requestRest(req, 'basicHealthCheck', req.body);

  response.success(req.requestId, {
    service: true,
    message: 'This is basic health check response'
  }, res);
};

module.exports.deepHealthCheck = (req, res) => {
  logger.requestRest(req, 'deepHealthCheck', req.body);

  response.success(req.requestId, {
    service: true,
    message: 'This is deep health check response'
  }, res);
};

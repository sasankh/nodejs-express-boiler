'use strict';

const route = require(`${global.__base}/server/routes/config/constants`);

const {
  logger
} = require(`${global.__base}/server/utilities`);

// const authorization = require(`${global.__base}/server/routes/config/authorization`);

// Handlersandlers
const health = require(`${global.__base}/server/handlers/health`);

module.exports = (app) => {
  // health checks
  app.get(route.home, health.home);
  app.get(route.basicHealthCheck, health.basicHealthCheck);
  app.get(route.deepHealthCheck, health.deepHealthCheck);

  logger.info('SERVICE', 'Routes initialized.');
};

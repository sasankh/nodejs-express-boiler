'use strict';

const route = require(`${global.__base}/server/routes/config/constants`);

const {
  logger
} = require(`${global.__base}/server/utilities`);

const authorization = require(`${global.__base}/server/routes/config/authorization`);

// Handlersandlers
const health = require(`${global.__base}/server/handlers/health`);
const registration = require(`${global.__base}/server/handlers/registration`);
const external = require(`${global.__base}/server/handlers/external`);
const users = require(`${global.__base}/server/handlers/users`);

module.exports = (app) => {
  // health checks
  app.get(route.home, health.home);
  app.get(route.basicHealthCheck, health.basicHealthCheck);
  app.get(route.deepHealthCheck, authorization.authCheck, health.deepHealthCheck);

  app.post(route.login, registration.login);

  // this is  for request test
  app.get(route.requestGoogle, external.requestGoogle);
  app.get(route.testMysql, external.testMysql);

  // user management
  app.post(route.addUser, users.addUser);
  app.get(route.userList, users.getUserList);

  // role management

  // application management

  logger.info('SERVICE', 'Routes initialized.');
};

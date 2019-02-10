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
const applications = require(`${global.__base}/server/handlers/applications`);
const tags = require(`${global.__base}/server/handlers/tags`);

module.exports = (app) => {
  // health checks
  app.get(route.home, health.home);
  app.get(route.basicHealthCheck, health.basicHealthCheck);
  app.get(route.deepHealthCheck, authorization.authCheck, health.deepHealthCheck);

  // this is  for request test
  app.get(route.requestGoogle, external.requestGoogle);
  app.get(route.testMysql, external.testMysql);

  // regiustration
  app.post(route.login, registration.login);
  app.post(route.authenticateUser, registration.authenticateUser);

  // user management
  app.post(route.addUser, users.addUser);
  app.get(route.userList, users.getUserList);
  app.put(route.resetPassword, users.resetPassword);
  app.get(route.userStatusList, users.getUserStatusList);
  app.get(route.userInfoById, users.getUserInfoById);
  app.put(route.userStatusChange, users.changeUserStatus);
  app.get(route.userTags, users.getUserTags);
  app.put(route.editUserInfo, users.editUserInfo);
  app.post(route.userTagActions, users.userTagActions);

  // application management
  app.post(route.addApplication, applications.addApplication);
  app.get(route.applicationStatusList, applications.getApplicationStatusList);
  app.put(route.applicationStatusChange, applications.changeApplicationStatus);
  app.get(route.applicationList, applications.getApplicationList);
  app.get(route.applicationInfoById, applications.getApplicationInfoById)

  // tag management
  app.post(route.addTag, tags.addTag);
  // app.get(route.applicationStatusList, tags.getApplicationStatusList);
  // app.put(route.applicationStatusChange, tags.changeApplicationStatus);
  // app.get(route.applicationList, tags.getApplicationList);
  // app.get(route.applicationInfoById, tags.getApplicationInfoById)

  logger.info('SERVICE', 'Routes initialized.');
};

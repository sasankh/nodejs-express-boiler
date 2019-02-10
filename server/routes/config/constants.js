'use strict';

const routes = {
  home: '/',
  basicHealthCheck: '/api/health',
  deepHealthCheck: '/api/health/deep',
  login: '/api/login',
  requestGoogle: '/api/google', // this is for request test
  testMysql: '/api/mysql', // this is for mysql test

  // user management
  addUser: '/api/users/add',
  userList: '/api/users/list',
  resetPassword: '/api/users/password/reset',
  authenticateUser: '/api/users/authenticate',
  userStatusList: '/api/users/status/list',
  userInfoById: '/api/users/info/:id',
  userStatusChange: '/api/users/status/change',
  userTags: '/api/users/tags/:id',
  editUserInfo: '/api/users/info/edit',
  userTagActions: '/api/users/tags/action',

  // application management
  addApplication: '/api/applications/add',
  applicationStatusList: '/api/applications/status/list',
  applicationStatusChange: '/api/applications/status/change',
  applicationList: '/api/applications/list',
  applicationInfoById: '/api/applications/info/:id',

  // tag management
  addTag: '/api/tags/add',
  tagStatusList: '/api/tags/status/list',
};

module.exports = routes;

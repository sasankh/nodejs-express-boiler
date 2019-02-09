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
  resetPassword: '/api/users/password/reset'

  // role management

  // application management
};

module.exports = routes;

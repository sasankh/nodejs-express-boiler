'use strict';

const Joi = require('joi');
const jwt = require('jsonwebtoken');

const config = require(`${global.__base}/server/config/config`);

const {
  crypt,
  logger
} = require(`${global.__base}/server/utilities`);

// loginModules
function Login(requestId, body) {
  this.requestId = requestId;
  this.body = body;
}

module.exports = Login;

Login.prototype.bodyValidation = function () {
  return new Promise((resolve, reject) => {
    logger.debug(this.requestId, 'bodyValidation');

    const schema = Joi.object().keys({
      username: Joi.string().min(1).required(),
      password: Joi.string().min(1).required()
    }).with('username', 'password');

    Joi.validate(this.body, schema, (err) => {
      if (err) {
        reject({
          code: 103,
          message: 'Missing required parameter',
          level: 'debug',
          details: err
        });
      } else {
        resolve();
      }
    });
  });
};

Login.prototype.authenticateUser = function () {
  return new Promise((resolve) => {
    logger.debug(this.requestId, 'authenticateUser');

    // perform ldap, mysql db check, etc
    // return user Info with roles. Roles should be array
    // mock data -->
    resolve({
      username: this.body.username,
      roles: ['PRIMARY'] // should be an array
    });
    // <-- mock data
  });
};

Login.prototype.generateToken = function (userInfo, ip, hostname) {
  return new Promise(async (resolve, reject) => {
    try {
      const payload = {
        username: this.body.username,
        roles: userInfo.roles,
        token_request_ip: ip,
        token_request_hostname: hostname
      };

      const token = await jwt.sign({
        data: crypt.encrypt(payload)
      }, config.jwt.secret, {
        algorithm: config.jwt.algorithm,
        expiresIn: config.jwt.expiresIn
      });

      resolve(token);
    } catch (e) {
      reject(e);
    }
  });
};


Login.prototype.responseBody = function (userInfo, token) {
  return new Promise((resolve) => {
    logger.debug(this.requestId, 'responseBody');

    const roles = userInfo.roles.map((role) => {
      return role.trim().toLowerCase();
    });

    const responseBody = {
      username: this.body.username,
      token,
      roles
    };

    resolve(responseBody);
  });
};

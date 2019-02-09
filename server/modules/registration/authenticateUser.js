'use strict';

const Joi = require('joi');

const config = require(`${global.__base}/server/config/config`);

const {
  bcrypt,
  logger,
  mysql
} = require(`${global.__base}/server/utilities`);

// authenticateUserModules
function AuthenticateUser(requestId, body) {
  this.requestId = requestId;
  this.body = body;
}

module.exports = AuthenticateUser;

AuthenticateUser.prototype.bodyValidation = function () {
  return new Promise((resolve, reject) => {
    logger.debug(this.requestId, 'bodyValidation');

    const schema = Joi.object().keys({
      username: Joi.string().empty(['', null]).trim().required(),
      password: Joi.string().empty(['', null]).trim().required()
    }).with('username', 'password');

    Joi.validate(this.body, schema, (err, value) => {
      if (err) {
        reject({
          code: 103,
          message: 'Missing required parameter',
          logLevel: 'debug',
          details: err
        });
      } else {
        this.body = value;
        resolve();
      }
    });
  });
};

AuthenticateUser.prototype.getUserData = function () {
  return new Promise(async (resolve, reject) => {
    try {
      logger.debug(this.requestId, 'getUserData');

      const query = 'SELECT u.username, u.email, u.phone, u.password_hash, u.password_salt FROM users u WHERE u.username = ?';
      const post = [this.body.username];

      const { results } = await mysql.query(this.requestId, 'internal', query, post);

      if (results.length === 1) {
        resolve(results[0]);
      } else if (results.length === 0){
        reject({
          code: 103,
          custom_message: 'User not found',
          level: 'debug'
        });
      } else {
        reject({
          code: 102,
          message: 'More then one user record found for the username. This should not happen',
          level: 'error'
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

AuthenticateUser.prototype.authenticateUser = function (password_hash) {
  return new Promise(async (resolve, reject) => {
    try {
      logger.debug(this.requestId, 'authenticateUser');

      const authenticated = await bcrypt.compare(this.requestId, this.body.password, password_hash);

      if (authenticated === true) {
        resolve(authenticated);
      } else {
        reject({
          code: 101,
          custom_message: 'Invalid password',
          level: 'debug'
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

AuthenticateUser.prototype.responseBody = function (authenticated, email) {
  return new Promise((resolve) => {
    logger.debug(this.requestId, 'responseBody');

    const responseBody = {
      username: this.body.username,
      email,
      authenticated
    };

    resolve(responseBody);
  });
};

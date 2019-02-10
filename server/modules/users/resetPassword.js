'use strict';

const Joi = require('joi');

const config = require(`${global.__base}/server/config/config`);

const {
  bcrypt,
  logger,
  mysql
} = require(`${global.__base}/server/utilities`);

// ResetPassword Modules
function ResetPassword(requestId, body) {
  this.requestId = requestId;
  this.body = body;
}

module.exports = ResetPassword;

ResetPassword.prototype.bodyValidation = function () {
  return new Promise((resolve, reject) => {
    try {
      logger.debug(this.requestId, 'bodyValidation');

      const schema = Joi.object().keys({
        username: Joi.string().min(3).trim().required(),
        // for live
        //current_password: Joi.string().trim().regex(/^[a-zA-Z0-9]{3,30}$/).required(),  // *** use for live
        //new_password: Joi.string().trim().regex(/^[a-zA-Z0-9]{3,30}$/).required()  // *** use for live
        // for test
        current_password: Joi.string().min(8).trim().required(),  // *** use of test
        new_password: Joi.string().min(8).trim().required()  // *** use of test
      })
      .with('username', 'current_password')
      .with('current_password', 'new_password');

      Joi.validate(this.body, schema, (err, value) => {
        if (err) {
          reject({
            code: 103,
            message: 'Missing or invalid required parameter'
          });
        } else {
          this.body = value;
          resolve();
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

ResetPassword.prototype.getUserData = function () {
  return new Promise(async (resolve, reject) => {
    try {
      logger.debug(this.requestId, 'getUserData');

      const query = 'SELECT u.username, u.password_hash, u.password_salt FROM users u WHERE u.username = ?';
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

ResetPassword.prototype.authenticateUser = function (password_hash) {
  return new Promise(async (resolve, reject) => {
    try {
      logger.debug(this.requestId, 'authenticateUser');

      const authenticated = await bcrypt.compare(this.requestId, this.body.current_password, password_hash);

      if (authenticated === true) {
        resolve();
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

ResetPassword.prototype.insertNewPassword = function (password_salt) {
  return new Promise(async (resolve, reject) => {
    try {
      logger.debug(this.requestId, 'insertNewPassword');

      const password_hash = await bcrypt.hash(this.requestId, password_salt, this.body.new_password);

      const query = 'UPDATE users u SET u.password_hash = ?, u.reset_password = ? WHERE u.username = ?';
      const post = [
        password_hash,
        false,
        this.body.username
      ];

      await mysql.query(this.requestId, 'internal', query, post);

      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

ResetPassword.prototype.responseBody = function () {
  return new Promise((resolve) => {
    logger.debug(this.requestId, 'responseBody');

    const responseBody = {
      username: this.body.username,
      success: true
    };

    resolve(responseBody);
  });
};

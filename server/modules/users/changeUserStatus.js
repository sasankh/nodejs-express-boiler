'use strict';

const Joi = require('joi');

const config = require(`${global.__base}/server/config/config`);

const {
  logger,
  mysql
} = require(`${global.__base}/server/utilities`);

const {
  userStatusList
} = require(`${global.__base}/server/config/users.dataFile`);

// ChangeUserStatus Modules
function ChangeUserStatus(requestId, body) {
  this.requestId = requestId;
  this.body = body;
}

module.exports = ChangeUserStatus;

ChangeUserStatus.prototype.bodyValidation = function () {
  return new Promise((resolve, reject) => {
    try {
      logger.debug(this.requestId, 'bodyValidation');

      const schema = Joi.object().keys({
        user_id: Joi.string().guid().empty(['', null]).trim().required(),
        current_status: Joi.string().empty(['', null]).trim().valid(userStatusList).required(),
        new_status: Joi.string().empty(['', null]).trim().valid(userStatusList).required()
      })
      .with('user_id', 'current_status')
      .with('current_status', 'new_status');

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

ChangeUserStatus.prototype.validateCurrentStatus = function () {
  return new Promise(async (resolve, reject) => {
    try {
      logger.debug(this.requestId, 'validateCurrentStatus');

      const query = `SELECT u.username, u.status FROM users u WHERE u.user_id = ? AND u.status = ?`
      const post = [this.body.user_id, this.body.current_status];

      const {
        results
      } = await mysql.query(this.requestId, 'internal', query, post);

      if (results.length === 1) {
        resolve();
      } else if (results.length === 0){
        reject({
          code: 103,
          custom_message: 'Invalid user or current user status',
          level: 'debug'
        });
      } else {
        reject({
          code: 102,
          message: 'More then one user result found for the give condition. This should not happen',
          level: 'error'
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

ChangeUserStatus.prototype.updateUserStatus = function () {
  return new Promise(async (resolve, reject) => {
    try {
      logger.debug(this.requestId, 'updateUserStatus');

      const query = 'UPDATE users u SET u.status = ? WHERE u.user_id = ? AND u.status = ?';
      const post = [
        this.body.new_status,
        this.body.user_id,
        this.body.current_status
      ];

      await mysql.query(this.requestId, 'internal', query, post);

      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

ChangeUserStatus.prototype.responseBody = function () {
  return new Promise((resolve) => {
    logger.debug(this.requestId, 'responseBody');

    const responseBody = {
      user_id: this.body.user_id,
      status_updated: true,
      status: this.body.new_status
    };

    resolve(responseBody);
  });
};

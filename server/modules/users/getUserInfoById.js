'use strict';

const Joi = require('joi');

const config = require(`${global.__base}/server/config/config`);

const {
  logger,
  mysql
} = require(`${global.__base}/server/utilities`);

// getUserInfoById Modules
function GetUserInfoById(requestId, params) {
  this.requestId = requestId;
  this.params = params;
}

module.exports = GetUserInfoById;

GetUserInfoById.prototype.paramValidation = function () {
  return new Promise((resolve, reject) => {
    try {
      logger.debug(this.requestId, 'paramValidation');

      const schema = Joi.object().keys({
        id: Joi.string().guid().empty(['', null]).trim()
      });

      Joi.validate(this.params, schema, (err, result) => {
        if (err) {
          reject({
            code: 103,
            custom_message: 'Invalid user id'
          });
        } else {
          this.params = result;
          resolve();
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

GetUserInfoById.prototype.getUserInfoById = function () {
  return new Promise(async (resolve, reject) => {
    try {
      logger.debug(this.requestId, 'getUserInfoById');

      const retrieve_columns = [
        'u.user_id',
        'u.username',
        'u.created_at',
        'u.reset_password',
        'u.email',
        'u.phone',
        'u.full_name',
        'u.status'
      ];

      const query = `SELECT ${retrieve_columns.join(',')} FROM users u WHERE user_id = ?`
      const post = [this.params.id]

      const {
        results
      } = await mysql.query(this.requestId, 'internal', query, post);

      if (results.length === 1) {
        resolve(results[0])
      } else if (results.length === 0){
        reject({
          code: 103,
          custom_message: 'User not found',
          level: 'debug'
        });
      } else {
        reject({
          code: 102,
          message: 'More then one user record found for the id. This should not happen',
          level: 'error'
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

GetUserInfoById.prototype.responseBody = function (userInfo) {
  return new Promise((resolve) => {
    logger.debug(this.requestId, 'responseBody');

    const responseBody = userInfo;

    resolve(responseBody);
  });
};

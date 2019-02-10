'use strict';

const Joi = require('joi');

const config = require(`${global.__base}/server/config/config`);

const {
  logger,
  mysql
} = require(`${global.__base}/server/utilities`);

// EditUserInfo Modules
function EditUserInfo(requestId, body) {
  this.requestId = requestId;
  this.body = body;
  this.userInfoAttributes = [
    'full_name',
    'phone'
  ];
}

module.exports = EditUserInfo;

EditUserInfo.prototype.bodyValidation = function () {
  return new Promise((resolve, reject) => {
    try {
      logger.debug(this.requestId, 'bodyValidation');

      const schema = Joi.object().keys({
        user_id: Joi.string().guid().empty(['', null]).trim().required(),
        full_name: Joi.string().min(3).empty(['', null]).trim(),
        phone: Joi.number().min(6)
      });

      Joi.validate(this.body, schema, (err, value) => {
        if (err) {
          reject({
            code: 103,
            message: 'Missing or invalid parameter values'
          });
        } else {
          this.body = value;
          const bodyAttributes = Object.keys(value);

          if (this.userInfoAttributes.some(attribute => bodyAttributes.indexOf(attribute) > -1)) {
            resolve();
          } else {
            reject({
              code: 103,
              custom_message: 'Missing user field to update'
            });
          }
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

EditUserInfo.prototype.getUserInfo= function () {
  return new Promise(async (resolve, reject) => {
    try {
      logger.debug(this.requestId, 'getUserInfo');

      const retrieve_columns = [
        'u.phone',
        'u.full_name'
      ];

      const query = `SELECT ${retrieve_columns.join(',')} FROM users u WHERE u.user_id = ?`
      const post = [this.body.user_id];

      const {
        results
      } = await mysql.query(this.requestId, 'internal', query, post);

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
          message: 'More then one user record found for the id. This should not happen',
          level: 'error'
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

EditUserInfo.prototype.updateUserInfo = function (userInfo) {
  return new Promise(async (resolve, reject) => {
    try {
      logger.debug(this.requestId, 'updateUserInfo');

      const query = 'UPDATE users u SET u.full_name = ?, u.phone = ? WHERE u.user_id = ?';
      const post = [
        (this.body.full_name ? this.body.full_name : userInfo.full_name),
        (this.body.phone ? this.body.phone : userInfo.phone),
        this.body.user_id
      ];

      await mysql.query(this.requestId, 'internal', query, post);

      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

EditUserInfo.prototype.responseBody = function () {
  return new Promise((resolve) => {
    logger.debug(this.requestId, 'responseBody');

    const responseBody = {
      success: true
    };

    resolve(responseBody);
  });
};

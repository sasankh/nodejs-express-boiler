'use strict';

const Joi = require('joi');

const config = require(`${global.__base}/server/config/config`);

const {
  logger,
  mysql
} = require(`${global.__base}/server/utilities`);

// getUserTags Modules
function GetUserTags(requestId, params) {
  this.requestId = requestId;
  this.params = params;
}

module.exports = GetUserTags;

GetUserTags.prototype.paramValidation = function () {
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
            message: 'Invalid user id'
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

GetUserTags.prototype.getUserTags = function () {
  return new Promise(async (resolve, reject) => {
    try {
      logger.debug(this.requestId, 'getUserTags');

      const query = `SELECT t.tag FROM user_tags ut LEFT JOIN tags t ON ut.tag_id = t.tag_id WHERE t.status = 'ACTIVE' AND ut.user_id = ?`;
      const post = [this.params.id];

      const {
        results: activeTags
      } = await mysql.query(this.requestId, 'internal', query, post);

      resolve({
        activeTags
      });
    } catch (e) {
      reject(e);
    }
  });
};

GetUserTags.prototype.responseBody = function (activeTags) {
  return new Promise((resolve) => {
    logger.debug(this.requestId, 'responseBody');

    const responseBody = {
      user_id: this.params.id,
      tags: activeTags
    };

    resolve(responseBody);
  });
};

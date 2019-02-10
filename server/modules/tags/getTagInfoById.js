'use strict';

const Joi = require('joi');

const config = require(`${global.__base}/server/config/config`);

const {
  logger,
  mysql
} = require(`${global.__base}/server/utilities`);

// GetTagInfoById Modules
function GetTagInfoById(requestId, params) {
  this.requestId = requestId;
  this.params = params;
}

module.exports = GetTagInfoById;

GetTagInfoById.prototype.paramValidation = function () {
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
            custom_message: 'Invalid tag id'
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

GetTagInfoById.prototype.getTagInfoById = function () {
  return new Promise(async (resolve, reject) => {
    try {
      logger.debug(this.requestId, 'getTagInfoById');

      const retrieve_columns = [
        't.tag_id',
        't.tag',
        't.status',
        'CONVERT(t.description USING utf8) as description',
        't.created_at',
        't.created_by',
        'a.application_name'
      ];

      const query = `SELECT ${retrieve_columns.join(',')} FROM tags t LEFT JOIN applications a ON t.application_id = a.application_id WHERE t.tag_id = ?`;
      const post = [this.params.id];

      const {
        results
      } = await mysql.query(this.requestId, 'internal', query, post);

      if (results.length === 1) {
        resolve(results[0]);
      } else if (results.length === 0){
        reject({
          code: 103,
          custom_message: 'Tag not found',
          level: 'debug'
        });
      } else {
        reject({
          code: 102,
          message: 'More then one tag record found for the id. This should not happen',
          level: 'error'
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

GetTagInfoById.prototype.responseBody = function (tagInfo) {
  return new Promise((resolve) => {
    logger.debug(this.requestId, 'responseBody');

    const responseBody = tagInfo;

    resolve(responseBody);
  });
};

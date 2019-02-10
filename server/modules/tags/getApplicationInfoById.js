'use strict';

const Joi = require('joi');

const config = require(`${global.__base}/server/config/config`);

const {
  logger,
  mysql
} = require(`${global.__base}/server/utilities`);

// GetApplicationInfoById Modules
function GetApplicationInfoById(requestId, params) {
  this.requestId = requestId;
  this.params = params;
}

module.exports = GetApplicationInfoById;

GetApplicationInfoById.prototype.paramValidation = function () {
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
            custom_message: 'Invalid application id'
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

GetApplicationInfoById.prototype.getApplicationInfoById = function () {
  return new Promise(async (resolve, reject) => {
    try {
      logger.debug(this.requestId, 'getApplicationInfoById');

      const retrieve_columns = [
        'a.application_id',
        'a.application_name',
        'a.status',
        'CONVERT(a.description USING utf8) as description',
        'a.created_at',
        'a.created_by'
      ];

      const query = `SELECT ${retrieve_columns.join(',')} FROM applications a WHERE a.application_id = ?`
      const post = [this.params.id];

      const {
        results
      } = await mysql.query(this.requestId, 'internal', query, post);

      if (results.length === 1) {
        resolve(results[0]);
      } else if (results.length === 0){
        reject({
          code: 103,
          custom_message: 'Application not found',
          level: 'debug'
        });
      } else {
        reject({
          code: 102,
          message: 'More then one application record found for the id. This should not happen',
          level: 'error'
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

GetApplicationInfoById.prototype.responseBody = function (applicationInfo) {
  return new Promise((resolve) => {
    logger.debug(this.requestId, 'responseBody');

    const responseBody = applicationInfo;

    resolve(responseBody);
  });
};

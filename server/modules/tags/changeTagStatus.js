'use strict';

const Joi = require('joi');

const config = require(`${global.__base}/server/config/config`);

const {
  logger,
  mysql
} = require(`${global.__base}/server/utilities`);

const {
  tagStatusList
} = require(`${global.__base}/server/config/tags.dataFile`);

// ChangeTagStatus Modules
function ChangeTagStatus(requestId, body) {
  this.requestId = requestId;
  this.body = body;
}

module.exports = ChangeTagStatus;

ChangeTagStatus.prototype.bodyValidation = function () {
  return new Promise((resolve, reject) => {
    try {
      logger.debug(this.requestId, 'bodyValidation');

      const schema = Joi.object().keys({
        tag_id: Joi.string().guid().empty(['', null]).trim().required(),
        current_status: Joi.string().empty(['', null]).trim().valid(tagStatusList).required(),
        new_status: Joi.string().empty(['', null]).trim().valid(tagStatusList).required()
      })
      .with('tag_id', 'current_status')
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

ChangeTagStatus.prototype.validateCurrentStatus = function () {
  return new Promise(async (resolve, reject) => {
    try {
      logger.debug(this.requestId, 'validateCurrentStatus');

      const query = `SELECT t.tag, t.status FROM tags t WHERE t.tag_id = ? AND t.status = ?`;
      const post = [this.body.tag_id, this.body.current_status];

      const {
        results
      } = await mysql.query(this.requestId, 'internal', query, post);

      if (results.length === 1) {
        resolve();
      } else if (results.length === 0){
        reject({
          code: 103,
          custom_message: 'Invalid tag or current tag status',
          level: 'debug'
        });
      } else {
        reject({
          code: 102,
          message: 'More then one tag result found for the give condition. This should not happen',
          level: 'error'
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

ChangeTagStatus.prototype.updateTagStatus = function () {
  return new Promise(async (resolve, reject) => {
    try {
      logger.debug(this.requestId, 'updateTagStatus');

      const query = 'UPDATE tags t SET t.status = ? WHERE t.tag_id = ? AND t.status = ?';
      const post = [
        this.body.new_status,
        this.body.tag_id,
        this.body.current_status
      ];

      await mysql.query(this.requestId, 'internal', query, post);

      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

ChangeTagStatus.prototype.responseBody = function () {
  return new Promise((resolve) => {
    logger.debug(this.requestId, 'responseBody');

    const responseBody = {
      tag_id: this.body.tag_id,
      status_updated: true,
      status: this.body.new_status
    };

    resolve(responseBody);
  });
};

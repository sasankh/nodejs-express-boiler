'use strict';

const Joi = require('joi');
const uuidv4 = require('uuid/v4');

const config = require(`${global.__base}/server/config/config`);

const {
  logger,
  mysql
} = require(`${global.__base}/server/utilities`);

// AddTag Modules
function AddTag(requestId, body) {
  this.requestId = requestId;
  this.body = body;
}

module.exports = AddTag;

AddTag.prototype.bodyValidation = function () {
  return new Promise((resolve, reject) => {
    try {
      logger.debug(this.requestId, 'bodyValidation');

      const schema = Joi.object().keys({
        tag: Joi.string().min(3).trim().uppercase().required(),
        description: Joi.string().min(3).trim().required(),
        application_id: Joi.string().guid().empty(['', null]).trim().required()
      })
      .with('tag', 'description');

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

AddTag.prototype.checkIfExistingTag = function () {
  return new Promise(async (resolve, reject) => {
    try {
      logger.debug(this.requestId, 'checkIfExistingTag');

      const query = 'SELECT t.tag_id, t.tag, t.created_by, t.created_at, t.status FROM tags t WHERE t.tag = ?';
      const post = [this.body.tag];
      const { results } = await mysql.query(this.requestId, 'internal', query, post);

      if (results.length > 0) {
        reject({
          code: 103,
          custom_message: 'Tag already exist',
          level: 'debug'
        })
      } else {
        resolve();
      }
    } catch (e) {
      reject(e);
    }
  });
};

AddTag.prototype.createNewtag = function () {
  return new Promise(async (resolve, reject) => {
    try {
      logger.debug(this.requestId, 'createNewtag');

      const query = 'INSERT INTO tags SET ?';
      const post = {
        tag_id: uuidv4(),
        tag: this.body.tag,
        description: this.body.description,
        created_by: 'NEED_TO_CHANGE', // *** update later to username from jwt token
        status: 'ACTIVE',
        application_id: this.body.application_id
      };

      const { results, fields } = await mysql.query(this.requestId, 'internal', query, post);

      resolve({
        tagId: post.tag_id,
        tagStatus: post.status
      });
    } catch (e) {
      reject(e);
    }
  });
};

AddTag.prototype.responseBody = function (tag_id, tagStatus) {
  return new Promise((resolve) => {
    logger.debug(this.requestId, 'responseBody');

    const responseBody = {
      tag_id,
      status: tagStatus,
      tag: this.body.tag
    };

    resolve(responseBody);
  });
};

'use strict';

const Joi = require('joi');
const uuidv4 = require('uuid/v4');

const config = require(`${global.__base}/server/config/config`);

const {
  logger,
  mysql
} = require(`${global.__base}/server/utilities`);

// AddApplication Modules
function AddApplication(requestId, body) {
  this.requestId = requestId;
  this.body = body;
}

module.exports = AddApplication;

AddApplication.prototype.bodyValidation = function () {
  return new Promise((resolve, reject) => {
    try {
      logger.debug(this.requestId, 'bodyValidation');

      const schema = Joi.object().keys({
        application_name: Joi.string().min(3).trim().required(),
        description: Joi.string().min(3).trim().required()
      })
      .with('application_name', 'description');

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

AddApplication.prototype.checkIfExistingApplication = function () {
  return new Promise(async (resolve, reject) => {
    try {
      logger.debug(this.requestId, 'checkIfExistingApplication');

      const query = 'SELECT a.application_id, a.application_name, a.created_by, a.created_at, a.status FROM applications a WHERE a.application_name = ?';
      const post = [this.body.application_name];
      const { results } = await mysql.query(this.requestId, 'internal', query, post);

      if (results.length > 0) {
        reject({
          code: 103,
          custom_message: 'Application already exist',
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

AddApplication.prototype.createNewApplication = function () {
  return new Promise(async (resolve, reject) => {
    try {
      logger.debug(this.requestId, 'createNewApplication');

      const query = 'INSERT INTO applications SET ?';
      const post = {
        application_id: uuidv4(),
        application_name: this.body.application_name,
        description: this.body.description,
        created_by: 'NEED_TO_CHANGE', // *** update later to username from jwt token
        status: 'ACTIVE'
      };

      const { results, fields } = await mysql.query(this.requestId, 'internal', query, post);

      resolve({
        application_id: post.application_id,
        applicationStatus: post.status
      });
    } catch (e) {
      reject(e);
    }
  });
};


AddApplication.prototype.responseBody = function (application_id, applicationStatus) {
  return new Promise((resolve) => {
    logger.debug(this.requestId, 'responseBody');

    const responseBody = {
      application_id,
      status: applicationStatus,
      application_name: this.body.application_name
    };

    resolve(responseBody);
  });
};

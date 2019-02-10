'use strict';

const Joi = require('joi');
const uuidv5 = require('uuid/v5');

const config = require(`${global.__base}/server/config/config`);

const {
  logger,
  mysql
} = require(`${global.__base}/server/utilities`);

const {
  userTagActions
} = require(`${global.__base}/server/config/users.dataFile`);

// UserTagActions Modules
function UserTagActions(requestId, body) {
  this.requestId = requestId;
  this.body = body;
}

module.exports = UserTagActions;

UserTagActions.prototype.bodyValidation = function () {
  return new Promise((resolve, reject) => {
    try {
      logger.debug(this.requestId, 'bodyValidation');

      const schema = Joi.object().keys({
        user_id: Joi.string().guid().empty(['', null]).trim().required(),
        tag_id: Joi.string().guid().empty(['', null]).trim().required(),
        action: Joi.string().empty(['', null]).trim().valid(userTagActions).required()
      })
      .with('user_id', 'tag_id')
      .with('tag_id', 'action');

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

UserTagActions.prototype.checkIfUserTagRelationExist = function () {
  return new Promise(async (resolve, reject) => {
    try {
      logger.debug(this.requestId, 'checkIfUserTagRelationExist');

      const query = `SELECT ut.id, ut.created_by FROM user_tags ut WHERE ut.user_id = ? AND ut.tag_id = ?`;
      const post = [this.body.user_id, this.body.tag_id];

      const {
        results
      } = await mysql.query(this.requestId, 'internal', query, post);

      if (results.length === 1) {
        resolve(true);
      } else if (results.length === 0){
        resolve(false);
      } else {
        reject({
          code: 102,
          message: 'More then one user tag relation entry found. There should only be 1 in the table. This should not happen',
          level: 'error'
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

function addTagToUser(requestId, userTagRelationExist, user_id, tag_id, created_by) {
  return new Promise(async (resolve, reject) => {
    try {
      if (userTagRelationExist) {
        reject({
          code: 103,
          custom_message: "Cannot add tag to user. User already has the tag",
          level: 'debug'
        });
      } else {
        query = 'INSERT INTO user_tags SET ?';
        post = {
          id: uuidv5(tag_id, user_id),
          user_id,
          tag_id,
          created_by
        };

        await mysql.query(requestId, 'internal', query, post);

        resolve();
      }
    } catch (e) {
      reject(e);
    }
  });
}

function removeTagFromUser(requestId, userTagRelationExist, user_id, tag_id) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!userTagRelationExist) {
        reject({
          code: 103,
          custom_message: "Cannot remove tag from user. User does not have the tag",
          level: 'debug'
        });
      } else {
        query = 'DELETE FROM user_tags ut WHERE ut.user_id = ? AND ut.tag_id = ?;'
        post = [
          user_id,
          tag_id
        ];

        await mysql.query(requestId, 'internal', query, post);

        resolve();
      }
    } catch (e) {
      reject(e);
    }
  });
}

UserTagActions.prototype.performUserTagAction = function (userTagRelationExist) {
  return new Promise(async (resolve, reject) => {
    try {
      logger.debug(this.requestId, 'updateUserStatus');

      if (this.action === 'ADD') {
        await addTagToUser(this.requestId, userTagRelationExist, this.body.user_id, this.body.tag_id, 'NEED_TO_CHANGE'); // use created_by from jwt token
        resolve();
      } else if (this.action === 'REMOVE') {
        await removeTagFromUser(this.requestId, userTagRelationExist, this.body.user_id, this.body.tag_id);
        resolve();
      } else {
        reject({
          code: 102,
          message: `Requested action not available. Contact developer. Action - ${this.body.action}`
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

UserTagActions.prototype.responseBody = function () {
  return new Promise((resolve) => {
    logger.debug(this.requestId, 'responseBody');

    const responseBody = {
      action: this.body.action,
      success: true
    };

    resolve(responseBody);
  });
};

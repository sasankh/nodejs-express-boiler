'use strict';

const Joi = require('joi');
const uuidv4 = require('uuid/v4');

const config = require(`${global.__base}/server/config/config`);

const {
  bcrypt,
  logger,
  mysql
} = require(`${global.__base}/server/utilities`);

// addUser Modules
function AddUser(requestId, body) {
  this.requestId = requestId;
  this.body = body;
}

module.exports = AddUser;

AddUser.prototype.bodyValidation = function () {
  return new Promise((resolve, reject) => {
    try {
      logger.debug(this.requestId, 'bodyValidation');

      const schema = Joi.object().keys({
        username: Joi.string().min(3).trim().required(),
        //password: Joi.string().trim().regex(/^[a-zA-Z0-9]{3,30}$/).required(),  // *** use for live
        password: Joi.string().min(8).trim().required(),  // *** use of test
        email: Joi.string().email({ minDomainAtoms: 2 }).trim(),
        full_name: Joi.string().min(3).trim().required(),
        phone: Joi.number().min(6)
      })
      .with('username', 'password')
      .with('password', 'email',)
      .with('email', 'full_name');

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

AddUser.prototype.checkIfExistingUser = function () {
  return new Promise(async (resolve, reject) => {
    try {
      logger.debug(this.requestId, 'checkIfExistingUser');

      const query = 'SELECT username, email FROM users where username = ? OR email = ?';
      const post = [this.body.username.trim(), this.body.email.trim()];
      const { results } = await mysql.query(this.requestId, 'internal', query, post);

      if (results.length > 0) {
        reject({
          code: 103,
          custom_message: 'Username or Email already exist',
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

AddUser.prototype.insertNewUser = function () {
  return new Promise(async (resolve, reject) => {
    try {
      logger.debug(this.requestId, 'insertNewUser');

      const user_id = uuidv4();
      const {
        salt: password_salt,
        hash: password_hash
      } = await bcrypt.generateSaltAndHash(this.requestId, 10, this.body.password.trim());

      const query = 'INSERT INTO users SET ?';
      const post = {
        user_id,
        username: this.body.username.trim(),
        password_hash,
        password_salt,
        email: this.body.email.trim(),
        full_name: this.body.full_name.trim(),
        phone: (this.body.phone ? this.body.phone : null),
        created_by: 'NEED_TO_CHANGE', // *** update later to username from jwt token
        status: 'ACTIVE',
        reset_password: true
      };

      const { results, fields } = await mysql.query(this.requestId, 'internal', query, post);

      resolve({
        userStatus: post.status,
        requirePwdReset: post.reset_password
      });
    } catch (e) {
      reject(e);
    }
  });
};


AddUser.prototype.responseBody = function (userStatus, requirePwdReset) {
  return new Promise((resolve) => {
    logger.debug(this.requestId, 'responseBody');

    const responseBody = {
      username: this.body.username.trim(),
      email: this.body.email.trim(),
      full_name: this.body.full_name.trim(),
      phone: this.body.phone,
      user_status: userStatus,
      require_pwd_reset: requirePwdReset
    };

    resolve(responseBody);
  });
};

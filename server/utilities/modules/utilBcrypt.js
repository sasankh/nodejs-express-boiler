'use strict';

const bcrypt = require('bcrypt');

const logger = require(`${global.__base}/server/utilities/modules/utilLogger`);

function generateSalt(requestId, saltRounds) {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(saltRounds, (err, salt) => {
      if (err) {
        logger.error(requestId, 'Problem with bcrypt salt generation', err);

        reject({
          code: 102,
          message: 'Problem with bcrypt salt generation'
        });
      } else {
        resolve(salt);
      }
    });

  });
};

function hash(requestId, salt, textToHash) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(textToHash, salt, (err, hash) => {
      if (err) {
        logger.error(requestId, 'Problem with bcrypt hashing', err);

        reject({
          code: 102,
          message: 'Problem with bcrypt hashing'
        });
      } else {
        resolve(hash);
      }
    });
  });
};

function generateSaltAndHash(requestId, saltRounds, textToHash) {
  return new Promise(async (resolve, reject) => {
    try {
      const salt = await generateSalt(requestId, saltRounds);
      const generatedHash = await hash(requestId, salt, textToHash);

      resolve({
        salt,
        hash: generatedHash
      });

    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  generateSalt,
  hash,
  generateSaltAndHash
}

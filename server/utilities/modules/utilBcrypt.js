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
}

function hash(requestId, salt, textToHash) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(textToHash, salt, (err, resultHash) => {
      if (err) {
        logger.error(requestId, 'Problem with bcrypt hashing', err);

        reject({
          code: 102,
          message: 'Problem with bcrypt hashing'
        });
      } else {
        resolve(resultHash);
      }
    });
  });
}

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
}

function compare(requestId, textToCompare, hashToCompare) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(textToCompare, hashToCompare, (err, result) => {
      if (err) {
        logger.error(requestId, 'Problem with bcrypt compare', err);

        reject({
          code: 102,
          message: 'Problem with bcrypt compare'
        });
      } else {
        resolve(result);
      }
    });
  });
}

module.exports = {
  generateSalt,
  hash,
  generateSaltAndHash,
  compare
};

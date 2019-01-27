'use strict';

const config = require(`${global.__base}/server/config/config`);

const encryptor = require('simple-encryptor')(config.app.encryptionSecret);

module.exports.encrypt = (value) => {
  return encryptor.encrypt(value);
};

module.exports.decrypt = (value) => {
  return encryptor.decrypt(value);
};

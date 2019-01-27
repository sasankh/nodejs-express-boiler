'use strict';

const fs = require('fs');

const logger = require(`${global.__base}/server/utilities/modules/utilLogger`);

module.exports.deleteFileNoCallback = (requestId, path) => {
  fs.unlink(path, (err) => {
    if (err && err.code !== 'ENOENT') {
      logger.warn(requestId, `Problem deleting file --> ${path}`, err);
    } else {
      logger.debug(requestId, `File deleted --> ${path}`);
    }
  });
};

'use strict';

const logger = require(`${global.__base}/server/utilities/modules/utilLogger`);

const request = require(`${global.__base}/server/init/request`);

module.exports = (requestId, options) => {
  return new Promise((resolve, reject) => {
    try {
      logger.debug(requestId, 'Request', options);

      let remoteService = 'REMOTE_SERVICE_UNKNOWN';

      if (options) {
        if (options.url) {
          remoteService = options.url;
        }

        if (options.uri) {
          remoteService = options.url;
        }
      }

      request(remoteService)(options, (err, response, body) => {
        if (err) {
          logger.error(requestId, 'Request-Error. Unable to make request to remote service', err);
          reject({
            code: 102,
            message: 'Unable to make request to remote service'
          });
        } else {
          resolve({
            body,
            response
          });
        }
      });
    } catch (e) {
      logger.error(requestId, 'Request-Exception-Error', e);
      reject({
        code: 102,
        message: 'An exception occured during request to remote service'
      });
    }
  });
};

'use strict';

const cors = require('cors');
const asyncLib = require('async');

const {
  logger
} = require(`${global.__base}/server/utilities/index`);

module.exports.cors = (allowedOrigins) => {
  const options = {
    methods: [
      'GET',
      'PUT',
      'POST',
      'DELETE',
      'OPTIONS'
    ],
    allowedHeaders: [
      'Content-Type',
      'Authorization'
    ]
  };

  if (allowedOrigins && allowedOrigins.constructor === Array) {
    options.origin = allowedOrigins;
    return cors(options);
  }

  return cors();
};

module.exports.accessControlAllow = (allowedOrigins) => {
  return (req, res, next) => {
    // Allow origin access
    if (allowedOrigins) {
      // 1) The below code restricts browser request from origin in the array. secure. Make env value
      if (allowedOrigins.indexOf(req.headers.origin.trim()) > -1) {
        res.header('Access-Control-Allow-Origin', req.headers.origin.trim());
      }
    } else {
      // 2) Allow request from anywhere
      res.header('Access-Control-Allow-Origin', '*');
    }

    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  };
};

// expected format string --> [http://127.0.0.1:8080, https://127.0.0.1:8080]
module.exports.parseAccessOrigin = (origin) => {
  return new Promise((resolve) => {
    if (origin) {
      const rawOrigin = origin.trim();

      if (
        typeof rawOrigin === 'string'
        && rawOrigin.length > 9
        && rawOrigin[0] === '['
        && rawOrigin[rawOrigin.length - 1] === ']'
      ) {
        let tmpValue = rawOrigin.substr(1, rawOrigin.length - 2);
        tmpValue = tmpValue.replace(/ /g, '');
        const originList = tmpValue.split(',');

        const acceptedPrefix = [
          'http://',
          'https://'
        ];

        asyncLib.map(originList, (accessOrigin, callback) => {
          if (accessOrigin.length > 7) {
            const prefix1 = accessOrigin.substr(0, 7);
            const prefix2 = accessOrigin.substr(0, 8);

            if (acceptedPrefix.indexOf(prefix1) > -1 || acceptedPrefix.indexOf(prefix2) > -1) {
              callback(null);
            } else {
              callback(`${accessOrigin} not a valid origin`);
            }
          } else {
            callback(`${accessOrigin} not a valid origin`);
          }
        }, (err) => {
          if (err) {
            logger.error('SERVICE', 'Killing service', err);
            process.exit(1);
          } else {
            resolve(originList);
          }
        });
      } else {
        logger.error('SERVICE', 'Killing service. Expecting a array string. Eg: [http://127.0.0.1:8080, https://127.0.0.1:8080]', rawOrigin);
        process.exit(1);
      }
    } else {
      resolve();
    }
  });
};

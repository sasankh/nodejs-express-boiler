'use strict';

const config = require(`${global.__base}/server/config/config`);
const logger = require(`${global.__base}/server/utilities/modules/utilLogger`);

const errorResponseBody = (requestId, httpCode, message, error) => {
  const proxyErrorMessage = {
    error: {
      httpCode,
      message: error.custom_message || message,
      internal: {
        requestId,
        code: error.code
      }
    }
  };

  logger.debug(requestId, 'proxyErrorMessage', proxyErrorMessage);
  return proxyErrorMessage;
};

const internalError = (requestId, e, res) => {
  if (e && e.message && e.stack) {
    logger.error(requestId, 'Exception', {
      message: e.message,
      stack: e.stack
    });
  } else {
    logger.error(requestId, 'Exception', e);
  }

  res.status(500).send({
    error: {
      httpCode: 500,
      message: 'Something went wrong',
      internal: {
        requestId,
        code: 102,
        systemMessage: 'Check logs'
      }
    }
  });
};

module.exports.success = (requestId, body, res) => {
  res.status(200).send(body);
};

const internalCodes = [
  100,
  101,
  102,
  103
];

module.exports.failure = (requestId, error, res) => {
  try {
    let body;

    if (error && error.code && (error.message || error.custom_message)) {
      logger.log_reject(requestId, error);

      const internalCode = parseInt(error.code.toString().split('.')[0], 10);

      if (internalCodes.indexOf(internalCode) > -1) {
        let message;
        let httpCode;

        switch (internalCode) {
        case 101:
          httpCode = 401;
          message = 'Unauthorized.';
          body = errorResponseBody(requestId, httpCode, message, error);
          break;

        case 102:
          httpCode = 500;
          message = 'Internal server error';
          body = errorResponseBody(requestId, httpCode, message, error);
          break;

        case 103:
          httpCode = 400;
          message = 'Parameter error.';
          body = errorResponseBody(requestId, httpCode, message, error);
          break;

        case 100:
          httpCode = error.http_code || 500;
          message = (error.http_code ? 'Http code supplied' : 'Http code not supplied using default 500');
          systemMessage = message;
          body = errorResponseBody(requestId, httpCode, message, error);
          if (!error.http_code) {
            body.error.internal.system_message = systemMessage;
          }
          break;
        }

        res.status(httpCode).send(body);
      } else {
        internalError(requestId, error, res);
      }
    } else {
      internalError(requestId, error, res);
    }
  } catch (e) {
    internalError(requestId, e, res);
  }
}

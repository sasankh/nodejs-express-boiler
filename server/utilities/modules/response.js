'use strict';

const config = require(`${global.__base}/server/config/config`);
const logger = require(`${global.__base}/server/utilities/modules/utilLogger`);

const responseBody = (requestId, httpCode, internalCode, message, body) => {
  logger.debug(requestId, 'responseBody', body);

  const proxyErrorMessage = {
    error: {
      httpCode,
      code: config.app.environment === 'production' ? internalCode : body.code,
      message: body.custom_message || message,
      parameters: body.parameters,
      internal: {
        requestId,
        code: internalCode,
        message
      }
    }
  };

  logger.debug(requestId, 'proxyErrorMessage', proxyErrorMessage);
  return proxyErrorMessage;
};

const internalError = (requestId, e, res) => {
  logger.error(requestId, e.message, e.stack);
  res.status(500).send({
    error: {
      httpCode: 500,
      code: 102,
      message: 'Something went wrong',
      internal: {
        requestId,
        code: 102,
        message: 'Something went wrong'
      }
    }
  });
};

module.exports.success = (requestId, body, res) => {
  logger.debug(requestId, 'Success Response', body);
  res.status(200).send(body);
};

module.exports.failure = (requestId, error, res) => {
  try {
    let body;
    if (error && error.code && (error.message || error.custom_message)) {
      const internalCode = parseInt(error.code.toString().split('.')[0], 10);
      let message;
      let httpCode;

      switch (internalCode) {
      case 103:
        httpCode = 400;
        message = 'Parameter error.';
        body = responseBody(requestId, httpCode, internalCode, message, error);
        res.status(httpCode).send(body);
        break;

      case 102:
        httpCode = 500;
        message = 'Internal server error.';
        body = responseBody(requestId, httpCode, internalCode, message, error);
        res.status(httpCode).send(body);
        break;

      case 101:
        httpCode = 401;
        message = 'Unauthorized.';
        body = responseBody(requestId, httpCode, internalCode, message, error);
        res.status(httpCode).send(body);
        break;

      default:
        break;
      }
    } else {
      internalError(requestId, error, res);
    }
  } catch (e) {
    internalError(requestId, error, res);
  }
};

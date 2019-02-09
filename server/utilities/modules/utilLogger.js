'use strict';

const {
  logFormat
} = require(`${global.__base}/server/config/config`).log;

const {
  main,
  health
} = require(`${global.__base}/server/init/logger`);

function log(data) {
  main.log(data);
}

function request(requestId, handlerName, payload) {
  const logData = {
    requestId,
    request: handlerName
  };

  if (['login', 'authentication'].indexOf(handlerName) === -1) {
    logData.payload = payload;
  }

  switch (logFormat) {
  case 'json':
    main.info(JSON.stringify(logData));
    break;

  case 'sentence':
  default:
    const payloadString = (logData.payload ? ` payload --> ${JSON.stringify(logData.payload)}` : '');
    main.info(`[${logData.requestId}] -> request-${logData.request}.${payloadString}`);
  }
}

function requestRest(req, handlerName, payload) {
  const logData = {
    requestId: req.requestId,
    ip: req.ip,
    hostname: req.hostname,
    url: req.url,
    method: req.method,
    request: handlerName
  };

  if (['login', 'authentication'].indexOf(handlerName) === -1) {
    logData.payload = payload;
  }

  switch (logFormat) {
  case 'json':
    main.info(JSON.stringify(logData));
    break;

  case 'sentence':
  default:
    const prefixString = `[${logData.requestId}] -> ${logData.ip}/${logData.hostname} -> ${logData.url} -> ${logData.method}`;
    const payloadString = (logData.payload ? ` payload --> ${JSON.stringify(logData.payload)}` : '');
    main.info(`${prefixString} -> request-${logData.request}.${payloadString}`);
  }
}

function WriteLogClass(level) {
  this.level = level;

  this.write = (requestId, message, details) => {
    const logData = {
      requestId,
      message
    };

    if (details) {
      if (details.stack && details.message) {
        logData.details = {
          message: details.message,
          stack: details.stack
        };
      } else {
        logData.details = details;
      }
    }

    switch (logFormat) {
    case 'json':
      main[this.level](JSON.stringify(logData));
      break;

    case 'sentence':
    default:
      const detailsSentence = (logData.details ? ` -- details --> ${JSON.stringify(logData.details)}` : '');
      main[this.level](`[${logData.requestId}] -> ${logData.message}${detailsSentence}`);
    }
  };
}

const loggers = {
  error: new WriteLogClass('error'),
  warn: new WriteLogClass('warn'),
  info: new WriteLogClass('info'),
  verbose: new WriteLogClass('verbose'),
  debug: new WriteLogClass('debug'),
  silly: new WriteLogClass('silly')
};

function logManager(requestId, body) {
  let level = 'error';
  let message;

  if (body) {
    if (body.level) {
      level = body.level;
    }

    if (body.custom_message) {
      message = body.custom_message;
    }

    if (body.message) {
      message = body.message;
    }

    loggers[level].write(requestId, message, body.details);
  }
}

function logReject(requestId, body) {
  if (body) {
    logManager(requestId, body);
  } else {
    const body = {
      level: 'warn',
      message: `Exception. Reject log without a body. Please, pass reject body to log_reject. RequestId: ${requestId}`
    }

    logManager(requestId, body);
  }
}

module.exports = {
  main,
  health,
  log,
  request,
  requestRest,
  error: loggers.error.write,
  warn: loggers.warn.write,
  info: loggers.info.write,
  verbose: loggers.verbose.write,
  debug: loggers.debug.write,
  silly: loggers.silly.write,
  log_reject: logReject,
  log_manager: logManager
};

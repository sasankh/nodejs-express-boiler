'use strict';

require('dotenv').config({
  path: './.env'
});

global.__base = __dirname;

const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const compression = require('compression');

const config = require(`${global.__base}/server/config/config`);

const {
  addRequestId,
  parseAccessOrigin,
  cors,
  zipkinMiddleware,
  zipkinMiddleware2
} = require(`${global.__base}/server/middlewares`);

const {
  logger
} = require(`${global.__base}/server/utilities`);

const apis = require(`${global.__base}/server/routes/api`);

let server;

async function initialize() {
  try {

    const app = express();
    app.set('port', config.app.port);

    // middlewares
    app.use(morgan('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(compression());
    app.use(methodOverride());
    app.use(addRequestId);
    app.use(helmet());

    app.set('trust proxy', 1);

    const allowedOrigins = await parseAccessOrigin(config.app.accessOrigins);
    app.use(cors(allowedOrigins));
    // app.use(zipkinMiddleware());
    app.use(zipkinMiddleware2());

    // routes
    apis(app);

    server = app.listen(app.get('port'), () => {
      logger.info('SERVICE', `Service is initialized at port ${app.get('port')}`);
    });

    server.timeout = JSON.parse(config.app.requestTimeout);
  } catch (e) {
    logger.error('SERVICE', 'Problem with service', e);
  }
}

initialize();

module.exports = server;

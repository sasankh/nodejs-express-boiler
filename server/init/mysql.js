'use strict';

const rawMysql = require('mysql');

const config = require(`${global.__base}/server/config/config`);
const {
  wrapMysql,
  addTracerToConnection
} = require(`${global.__base}/server/lib/zipkin/zipkin-instrumentation-mysql`);
const {
  getZipkinTracer
} = require(`${global.__base}/server/lib/zipkin/zipkin-setup`);

const logger = require(`${global.__base}/server/utilities/modules/utilLogger`);

const tracer = getZipkinTracer(
  config.zipkin.recorderType,
  config.app.applicationService,
  config.zipkin.remoteHttp
);

const mysql = wrapMysql(rawMysql, tracer);

let dbList = Object.keys(config.mysql);

const dbs = {};

function addConnectionTracer(Connection) {
  return addTracerToConnection(tracer, Connection);
}

function initializeDb(dbName, options) {
  logger.info('SERVICE', `Initilizing mysql db ${dbName}`);

  dbs[dbName] = mysql.createPool(options);
}

if (dbList.length > 0) {
  dbList.forEach((dbName) => {
    initializeDb(dbName, config.mysql[dbName]);
  });
}

dbList = Object.keys(dbs);

module.exports = {
  mysql,
  dbs,
  dbList,
  zipkinTracer: tracer,
  addConnectionTracer
};

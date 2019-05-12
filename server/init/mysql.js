'use strict';

const rawMysql = require('mysql');

const config = require(`${global.__base}/server/config/config`);
const logger = require(`${global.__base}/server/utilities/modules/utilLogger`);

const mysql = rawMysql;

let dbList = Object.keys(config.mysql);

const dbs = {};

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
  dbList
};

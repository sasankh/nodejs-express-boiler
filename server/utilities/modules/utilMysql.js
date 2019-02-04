'use strict';

const logger = require(`${global.__base}/server/utilities/modules/utilLogger`);

const {
  dbs,
  dbList,
  addConnectionTracer
} = require(`${global.__base}/server/init/mysql`);

function getPool(requestId, dbName) {
  return new Promise((resolve, reject) => {
    if (dbs && dbs[dbName]) {
      resolve(dbs[dbName]);
    } else {
      logger.error(requestId, `Mysql-Error. Reqested db pool not available - ${dbName}`);
      reject({
        code: 103,
        message: `Reqested db pool not available - ${dbName}`
      });
    }
  });
}

function getConnection(requestId, dbName) {
  return new Promise((resolve, reject) => {
    if (dbs && dbs[dbName]) {
      dbs[dbName].getConnection((err, connection) => {
        if (err) {
          logger.error(requestId, `Mysql-Error. Problem getting db connection - ${dbName}`, err);
          reject({
            code: 103,
            message: `Problem getting db connection - ${dbName}`
          });
        } else {
          const newConnection = addConnectionTracer(connection);
          resolve(newConnection);
        }
      });
    } else {
      logger.error(requestId, `Mysql-Error-Exception. Reqested db connection not available - ${dbName}`);
      reject({
        code: 103,
        message: `Reqested db connection not available - ${dbName}`
      });
    }
  });
}

function beginTransaction(requestId, dbName) {
  return new Promise((resolve, reject) => {
    if (dbs && dbs[dbName]) {
      dbs[dbName].getConnection((err, connection) => {
        if (err) {
          logger.error(requestId, `Mysql-Error. Problem getting db connection - ${dbName}`, err);
          reject({
            code: 102,
            message: `Problem getting db connection - ${dbName}`
          });
        } else {
          connection.beginTransaction((err2) => {
            if (err2) {
              connection.release();
              logger.error(requestId, `Mysql-Error. Problem getting mysql transaction connection - ${dbName}`, err2);
              reject({
                code: 102,
                message: `Problem getting mysql transaction connection - ${dbName}`
              });
            } else {
              const newConnection = addConnectionTracer(connection);

              logger.info(requestId, `Beginning mysql transaction - db - ${newConnection.config.database}`);
              resolve(newConnection);
            }
          });
        }
      });
    } else {
      logger.error(requestId, `Mysql-Error-Exception. Problem getting mysql transaction connection - ${dbName}`);
      reject({
        code: 102,
        message: `Problem getting mysql transaction connection - ${dbName}`
      });
    }
  });
}

function commit(requestId, connection) {
  return new Promise((resolve, reject) => {
    try {
      logger.info(requestId, `Commiting - db - ${connection.config.database}`);

      connection.commit((err) => {
        if (err) {
          logger.error(requestId, 'Mysql-Error. Problem performing db commit', err);
          reject({
            code: 102,
            message: 'Problem performing db commit'
          });
        } else {
          resolve();
        }
      });
    } catch (e) {
      logger.error(requestId, 'Mysql-Error-Exception. Problem performing db commit', e);
      reject({
        code: 102,
        message: 'Problem performing db commit'
      });
    }
  });
}

function rollback(requestId, connection) {
  return new Promise((resolve, reject) => {
    try {
      logger.info(requestId, `Rollback - db - ${connection.config.database}`);

      connection.rollback((err) => {
        if (err) {
          logger.error(requestId, 'Mysql-Error. Problem performing db rollback', err);
          reject({
            code: 102,
            message: 'Problem performing db rollback'
          });
        } else {
          resolve();
        }
      });
    } catch (e) {
      logger.error(requestId, 'Mysql-Error-Exception. Problem performing db rollback', e);
      reject({
        code: 102,
        message: 'Problem performing db rollback'
      });
    }
  });
}

// function query(requestId, database, query, values, log) {
//   return new Promise(async (resolve, reject) {
//     try {
//       let db = database;
//
//       if (typeof db === 'string' && dbList.indexOf(db.trim()) > -1) {
//         db = await getConnection(requestId, database.trim());
//       } else if (typeof )
//     } catch (e) {
//       logger.error(requestId, 'Mysql-Query-Error', e);
//       reject({
//         code: 102,
//         message: 'An exception occured during mysql query'
//       });
//     }
//   });
// }

module.exports = {
  getPool,
  getConnection,
  beginTransaction,
  commit,
  rollback
};

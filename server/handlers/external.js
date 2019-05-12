'use strict';

const {
  logger,
  request,
  response,
  mysql
} = require(`${global.__base}/server/utilities`);

module.exports.requestGoogle = async (req, res) => {
  try {
    logger.requestRest(req, 'requestGoogle');

    const options = {
      method: 'GET',
      url: 'https://www.google.com/'
    };

    const { body: responseBody } = await request(req.requestId, options);

    response.success(req.requestId, responseBody, res);
  } catch (e) {
    response.failure(req.requestId, e, res);
  }
};

module.exports.testMysql = async (req, res) => {
  try {
    logger.requestRest(req, 'testMysql');

    const connection = await mysql.beginTransaction(req.requestId, 'replaceWithDbName');

    try {
      const { results, fields } = await mysql.query(req.requestId, connection, 'SELECT 1', []);

      await mysql.commit(req.requestId, connection);
      connection.release();

      response.success(req.requestId, {
        success: true,
        results,
        fields
      }, res);
    } catch (err) {
      await mysql.rollback(req.requestId, connection);
      connection.release();

      response.failure(req.requestId, {
        code: 102,
        message: 'Problem with sql query'
      }, res);
    }
  } catch (e) {
    response.failure(req.requestId, e, res);
  }
};

// module.exports.testMysql2 = async (req, res) => {
//   try {
//     logger.requestRest(req, 'testMysql2');
//
//     const connection = await mysql.beginTransaction(req.requestId, 'replaceWithDbName');
//
//     connection.query('SELECT 1', [], async (err, results, fields) => {
//       if (err) {
//         await mysql.rollback(req.requestId, connection);
//         connection.release();
//
//         response.failure(req.requestId, {
//           code: 102,
//           message: 'Problem with sql query'
//         }, res);
//       } else {
//         await mysql.commit(req.requestId, connection);
//         connection.release();
//
//         response.success(req.requestId, {
//           success: true,
//           results,
//           fields
//         }, res);
//       }
//     });
//   } catch (e) {
//     response.failure(req.requestId, e, res);
//   }
// };

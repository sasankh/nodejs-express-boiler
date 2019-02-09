'use strict';

const Joi = require('joi');

const config = require(`${global.__base}/server/config/config`);

const {
  logger,
  mysql
} = require(`${global.__base}/server/utilities`);

// getUserList Modules
function GetUserList(requestId, query) {
  this.requestId = requestId;
  this.query = query;
}

module.exports = GetUserList;

GetUserList.prototype.queryValidation = function () {
  return new Promise((resolve, reject) => {
    try {
      logger.debug(this.requestId, 'queryValidation');

      const schema = Joi.object().keys({
        limit: Joi.number().min(1).empty(['', null]).default(20),
        page: Joi.number().min(1).empty(['', null]).default(1),
        search_term: Joi.string().empty(['', null]).trim()
      });

      Joi.validate(this.query, schema, (err, result) => {
        if (err) {
          reject({
            code: 103,
            message: 'Missing or invalid required query parameter'
          });
        } else {
          this.query = result;
          resolve();
        }
      });
    } catch (e) {
      reject(e);
    }
  });
};

GetUserList.prototype.constructUserListQueries = function () {
  return new Promise(async (resolve, reject) => {
    try {
      logger.debug(this.requestId, 'constructUserListQueries');

      const retrieve_columns = [
        'u.user_id',
        'u.username',
        'u.created_at',
        'u.reset_password',
        'u.email',
        'u.phone',
        'u.full_name',
        'u.status'
      ];

      const fromSection = ' users as u ';

      const whereList = [];
      const orderByList = [];

      let whereSection = '';
      let orderBySection = '';

      if (this.query.search_term) {
        const escapedSearchTerm = mysql.escape(this.query.search_term);
        let likeCondition = `'%${escapedSearchTerm.substring(1, escapedSearchTerm.length - 1)}%'`;

        const searchSection = ` ((u.username LIKE ${likeCondition}) OR (u.email LIKE ${likeCondition}) OR (u.full_name LIKE ${likeCondition}))`;

        whereList.push(searchSection)
      }

      if (whereList.length > 0) {
        whereSection = ` WHERE ${whereList.join(' AND ')}`;
      }

      if (orderByList.length > 0) {
        orderBySection = ` ORDER BY ${orderBy.join(', ')}`;
      }

      const pageToUse = this.query.page - 1;
      const offset = (this.query.limit * pageToUse);

      const userListQuery = `SELECT ${retrieve_columns.join(',')} FROM ${fromSection} ${whereSection} ${orderBySection} LIMIT ${this.query.limit} OFFSET ${offset};`
      const totalUserQuery = `SELECT COUNT(*) as total FROM ${fromSection} ${whereSection};`;

      resolve({
        userListQuery,
        totalUserQuery
      });
    } catch (e) {
      reject(e);
    }
  });
};

GetUserList.prototype.getUserList = function (userListQuery, totalUserQuery) {
  return new Promise(async (resolve, reject) => {
    try {
      logger.debug(this.requestId, 'getUserList');

      const {
        results: userList
      } = await mysql.query(this.requestId, 'internal', userListQuery, []);

      const {
        results: totalResult
      } = await mysql.query(this.requestId, 'internal', totalUserQuery, []);

      const totalUsers = totalResult[0].total;

      resolve({
        userList,
        totalUsers
      });
    } catch (e) {
      reject(e);
    }
  });
};

GetUserList.prototype.responseBody = function (userList, totalUsers) {
  return new Promise((resolve) => {
    logger.debug(this.requestId, 'responseBody');

    const responseBody = {
      users: userList,
      list_length: userList.length,
      total_users: totalUsers,
      query: this.query
    };

    resolve(responseBody);
  });
};

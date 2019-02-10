'use strict';

const Joi = require('joi');

const config = require(`${global.__base}/server/config/config`);

const {
  logger,
  mysql
} = require(`${global.__base}/server/utilities`);

// GetApplicationList Modules
function GetApplicationList(requestId, query) {
  this.requestId = requestId;
  this.query = query;
}

module.exports = GetApplicationList;

GetApplicationList.prototype.queryValidation = function () {
  return new Promise((resolve, reject) => {
    try {
      logger.debug(this.requestId, 'queryValidation');

      const schema = Joi.object().keys({
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

GetApplicationList.prototype.constructApplicationListQueries = function () {
  return new Promise(async (resolve, reject) => {
    try {
      logger.debug(this.requestId, 'constructApplicationListQueries');

      const retrieve_columns = [
        'a.application_id',
        'a.application_name',
        'a.status',
        'CONVERT(a.description USING utf8) as description',
        'a.created_at',
        'a.created_by'
      ];

      const fromSection = ' applications as a ';

      const whereList = [];
      const orderByList = [];

      let whereSection = '';
      let orderBySection = '';

      if (this.query.search_term) {
        const escapedSearchTerm = mysql.escape(this.query.search_term);
        let likeCondition = `'%${escapedSearchTerm.substring(1, escapedSearchTerm.length - 1)}%'`;

        const searchSection = ` ((a.application_name LIKE ${likeCondition}))`;

        whereList.push(searchSection)
      }

      orderByList.push(' a.application_name ASC ');

      if (whereList.length > 0) {
        whereSection = ` WHERE ${whereList.join(' AND ')}`;
      }

      if (orderByList.length > 0) {
        orderBySection = ` ORDER BY ${orderByList.join(', ')}`;
      }

      const applicationListQuery = `SELECT ${retrieve_columns.join(',')} FROM ${fromSection} ${whereSection} ${orderBySection};`
      const totalApplicationQuery = `SELECT COUNT(*) as total FROM ${fromSection} ${whereSection};`;

      resolve({
        applicationListQuery,
        totalApplicationQuery
      });
    } catch (e) {
      reject(e);
    }
  });
};

GetApplicationList.prototype.getApplicationList = function (applicationListQuery, totalApplicationQuery) {
  return new Promise(async (resolve, reject) => {
    try {
      logger.debug(this.requestId, 'getApplicationList');

      const {
        results: applicationList
      } = await mysql.query(this.requestId, 'internal', applicationListQuery, []);

      const {
        results: totalResult
      } = await mysql.query(this.requestId, 'internal', totalApplicationQuery, []);

      const totalApplications = totalResult[0].total;

      resolve({
        applicationList,
        totalApplications
      });
    } catch (e) {
      reject(e);
    }
  });
};

GetApplicationList.prototype.responseBody = function (applicationList, totalApplications) {
  return new Promise((resolve) => {
    logger.debug(this.requestId, 'responseBody');

    const responseBody = {
      applications: applicationList,
      list_length: applicationList.length,
      total_applications: totalApplications,
      query: this.query
    };

    resolve(responseBody);
  });
};

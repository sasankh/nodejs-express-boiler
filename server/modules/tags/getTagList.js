'use strict';

const Joi = require('joi');

const config = require(`${global.__base}/server/config/config`);

const {
  logger,
  mysql
} = require(`${global.__base}/server/utilities`);

// GetTagList Modules
function GetTagList(requestId, query) {
  this.requestId = requestId;
  this.query = query;
}

module.exports = GetTagList;

GetTagList.prototype.queryValidation = function () {
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

GetTagList.prototype.constructTagListQueries = function () {
  return new Promise(async (resolve, reject) => {
    try {
      logger.debug(this.requestId, 'constructTagListQueries');

      const retrieve_columns = [
        't.tag_id',
        't.tag',
        't.status',
        'CONVERT(t.description USING utf8) as description',
        't.created_at',
        't.created_by',
        'a.application_name'
      ];

      const fromSection = ' tags t LEFT JOIN applications a ON t.application_id = a.application_id ';

      const whereList = [];
      const orderByList = [];

      let whereSection = '';
      let orderBySection = '';

      if (this.query.search_term) {
        const escapedSearchTerm = mysql.escape(this.query.search_term);
        let likeCondition = `'%${escapedSearchTerm.substring(1, escapedSearchTerm.length - 1)}%'`;

        const searchSection = ` ((t.tag LIKE ${likeCondition}))`;

        whereList.push(searchSection)
      }

      orderByList.push(' t.tag ASC ');

      if (whereList.length > 0) {
        whereSection = ` WHERE ${whereList.join(' AND ')}`;
      }

      if (orderByList.length > 0) {
        orderBySection = ` ORDER BY ${orderByList.join(', ')}`;
      }

      const tagListQuery = `SELECT ${retrieve_columns.join(',')} FROM ${fromSection} ${whereSection} ${orderBySection};`
      const totalTagQuery = `SELECT COUNT(*) as total FROM ${fromSection} ${whereSection};`;

      resolve({
        tagListQuery,
        totalTagQuery
      });
    } catch (e) {
      reject(e);
    }
  });
};

GetTagList.prototype.getTagList = function (tagListQuery, totalTagQuery) {
  return new Promise(async (resolve, reject) => {
    try {
      logger.debug(this.requestId, 'getTagList');

      const {
        results: tagList
      } = await mysql.query(this.requestId, 'internal', tagListQuery, []);

      const {
        results: totalResult
      } = await mysql.query(this.requestId, 'internal', totalTagQuery, []);

      const totalTags = totalResult[0].total;

      resolve({
        tagList,
        totalTags
      });
    } catch (e) {
      reject(e);
    }
  });
};

GetTagList.prototype.responseBody = function (tagList, totalTags) {
  return new Promise((resolve) => {
    logger.debug(this.requestId, 'responseBody');

    const responseBody = {
      tags: tagList,
      list_length: tagList.length,
      total_tags: totalTags,
      query: this.query
    };

    resolve(responseBody);
  });
};

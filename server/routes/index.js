'use strict';

const apis = require(`${global.__base}/server/routes/api`);

module.exports = (app) => {
  apis(app);
};

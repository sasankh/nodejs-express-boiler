'use strict';

const route = require(`${global.__base}/server/routes/config/constants`);

module.exports = {
  role: 'PRIMARY',
  description: 'Primary',
  access: {
    POST: [
    ],
    GET: [
      route.home,
      route.health,
      route.deepHealthCheck
    ],
    PUT: [
    ],
    DELETE: [
    ]
  }
};

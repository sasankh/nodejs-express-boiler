'use strict';

const cuid = require('cuid');

// middleware function for requestId
module.exports.addRequestId = (req, res, next) => {
  req.requestId = cuid();
  next();
};

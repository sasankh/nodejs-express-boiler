'use strict';

const {
  logger,
  request,
  response
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

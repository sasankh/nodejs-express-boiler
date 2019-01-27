'use strict';

const jwt = require('jsonwebtoken');

const config = require(`${global.__base}/server/config/config`);

const {
  crypt,
  logger,
  response
} = require(`${global.__base}/server/utilities`);

const acl = require(`${global.__base}/server/routes/config/acl/acl`);

function authenticateToken(requestId, token) {
  return new Promise((resolve, reject) => {
    if (token) {
      logger.debug(requestId, `token is: ${token}`);
      jwt.verify(token, config.jwt.secret, (err, decoded) => {
        if (err) {
          logger.debug(requestId, `Failed to authenticate token - ${err.name}`, err);
          reject({ code: 102, message: { message: 'Failed to authenticate token' } });
        } else {
          const decryptedData = crypt.decrypt(decoded.data);
          const authInfo = {
            token,
            tokenData: decoded,
            decryptedData,
            username: decryptedData.username,
            roles: decryptedData.roles,
            token_request_ip: decryptedData.token_request_ip,
            token_request_hostname: decryptedData.token_request_hostname,
            exp: decoded.exp,
            iat: decoded.iat
          };

          resolve(authInfo);
        }
      });
    } else {
      logger.warn(requestId, 'There is no token', token);
      reject({ code: 101, message: { message: 'Authentication Token not provided' } });
    }
  });
}

function endpointAuthorization(requestId, method, path, authInfo) {
  return new Promise(async (resolve, reject) => {
    const authorizedEndpointRoles = [];

    authInfo.roles.forEach((role) => {
      if (acl[role] && acl[role][method] && acl[role][method].includes(path)) {
        authorizedEndpointRoles.push(role);
      }
    });

    if (authorizedEndpointRoles.length > 0) {
      resolve(authorizedEndpointRoles);
    } else {
      logger.debug(requestId, 'Required application roles not available. Invalid User Roles');
      reject({ code: 101, message: { message: 'Failed to authenticate token.' } });
    }
  });
}

module.exports.authCheck = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const authInfo = await authenticateToken(req.requestId, token);
    const authorizedEndpointRoles = await endpointAuthorization(req.requestId, req.method, req.route.path, authInfo);

    logger.debug(req.requestId, `User: ${authInfo.username} successfully authorized.`);
    authInfo.authorizedEndpointRoles = authorizedEndpointRoles;
    req.authInfo = authInfo;

    return next();
  } catch (e) {
    return response.failure(req.requestId, e, res); // confirm adding return works
  }
};

'use strict';

const {
  logger,
  response
} = require(`${global.__base}/server/utilities`);

const Login = require(`${global.__base}/server/modules/registration/login`);
const AuthenticateUser = require(`${global.__base}/server/modules/registration/authenticateUser`);

module.exports.login = async (req, res) => {
  try {
    logger.requestRest(req, 'login');

    const login = new Login(req.requestId, req.body);

    await login.bodyValidation();
    const userInfo = await login.authenticateUser();
    const token = await login.generateToken(userInfo, req.ip, req.hostname);
    const responseBody = await login.responseBody(userInfo, token);

    response.success(req.requestId, responseBody, res);
  } catch (e) {
    response.failure(req.requestId, e, res);
  }
};

module.exports.authenticateUser = async (req, res) => {
  try {
    logger.requestRest(req, 'authenticateUser');

    const authenticateUser = new AuthenticateUser(req.requestId, req.body);

    await authenticateUser.bodyValidation();
    const { password_hash, email, status: userStatus } = await authenticateUser.getUserData();
    const authenticated = await authenticateUser.authenticateUser(password_hash, userStatus);
    const responseBody = await authenticateUser.responseBody(authenticated, userStatus, email);

    response.success(req.requestId, responseBody, res);
  } catch (e) {
    response.failure(req.requestId, e, res);
  }
};

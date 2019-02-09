'use strict';

const {
  logger,
  response
} = require(`${global.__base}/server/utilities`);

const Login = require(`${global.__base}/server/modules/registration/login`);
const AddUser = require(`${global.__base}/server/modules/registration/addUser`);

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

module.exports.addUser = async (req, res) => {
  try {
    logger.requestRest(req, 'addUser');

    const addUser = new AddUser(req.requestId, req.body);

    await addUser.bodyValidation();
    await addUser.checkIfExistingUser();
    const { userStatus, requirePwdReset } = await addUser.insertNewUser();
    const responseBody = await addUser.responseBody(userStatus, requirePwdReset);

    response.success(req.requestId, responseBody, res);
  } catch (e) {
    response.failure(req.requestId, e, res);
  }
};

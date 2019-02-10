'use strict';

const {
  logger,
  response
} = require(`${global.__base}/server/utilities`);

const {
  userStatusList
} = require(`${global.__base}/server/config/users.dataFile`);

const AddUser = require(`${global.__base}/server/modules/users/addUser`);
const GetUserList = require(`${global.__base}/server/modules/users/getUserList`);
const ResetPassword = require(`${global.__base}/server/modules/users/resetPassword`);
const GetUserInfoById = require(`${global.__base}/server/modules/users/getUserInfoById`);
const ChangeUserStatus = require(`${global.__base}/server/modules/users/changeUserStatus`);

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

module.exports.getUserList = async (req, res) => {
  try {
    logger.requestRest(req, 'getUserList', req.query);

    const getUserList = new GetUserList(req.requestId, req.query);

    await getUserList.queryValidation();
    const {
      userListQuery,
      totalUserQuery
    } = await getUserList.constructUserListQueries();
    const {
      userList,
      totalUsers
    } = await getUserList.getUserList(userListQuery, totalUserQuery);
    const responseBody = await getUserList.responseBody(userList, totalUsers);

    response.success(req.requestId, responseBody, res);
  } catch (e) {
    response.failure(req.requestId, e, res);
  }
};

module.exports.resetPassword = async (req, res) => {
  try {
    logger.requestRest(req, 'resetPassword');

    const resetPassword = new ResetPassword(req.requestId, req.body);

    await resetPassword.bodyValidation();
    const { password_hash, password_salt } = await resetPassword.getUserData();
    await resetPassword.authenticateUser(password_hash);
    await resetPassword.updateUserPassword(password_salt);
    const responseBody = await resetPassword.responseBody();

    response.success(req.requestId, responseBody, res);
  } catch (e) {
    response.failure(req.requestId, e, res);
  }
};

module.exports.getUserStatusList = async (req, res) => {
  try {
    logger.requestRest(req, 'getUserStatusList');

    const responseBody = {
      status_list: userStatusList
    }

    response.success(req.requestId, responseBody, res);
  } catch (e) {
    response.failure(req.requestId, e, res);
  }
};

module.exports.getUserInfoById = async (req, res) => {
  try {
    logger.requestRest(req, 'getUserInfoById', req.params);

    const getUserInfoById = new GetUserInfoById(req.requestId, req.params);

    await getUserInfoById.paramValidation();
    const userInfo = await getUserInfoById.getUserInfoById();
    const responseBody = await getUserInfoById.responseBody(userInfo);

    response.success(req.requestId, responseBody, res);
  } catch (e) {
    response.failure(req.requestId, e, res);
  }
};

module.exports.changeUserStatus = async (req, res) => {
  try {
    logger.requestRest(req, 'changeUserStatus');

    const changeUserStatus = new ChangeUserStatus(req.requestId, req.body);

    await changeUserStatus.bodyValidation();
    await changeUserStatus.validateCurrentStatus();
    await changeUserStatus.updateUserStatus();

    const responseBody = await changeUserStatus.responseBody();

    response.success(req.requestId, responseBody, res);
  } catch (e) {
    response.failure(req.requestId, e, res);
  }
};

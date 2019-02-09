'use strict';

const {
  logger,
  response
} = require(`${global.__base}/server/utilities`);

const AddUser = require(`${global.__base}/server/modules/users/addUser`);
const GetUserList = require(`${global.__base}/server/modules/users/getUserList`);

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

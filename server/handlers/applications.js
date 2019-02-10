'use strict';

const {
  logger,
  response
} = require(`${global.__base}/server/utilities`);

const {
  applicationStatusList
} = require(`${global.__base}/server/config/applications.dataFile`);

const AddApplication = require(`${global.__base}/server/modules/applications/addApplication`);
const ChangeApplicationStatus = require(`${global.__base}/server/modules/applications/changeApplicationStatus`);
// const GetUserList = require(`${global.__base}/server/modules/applications/getUserList`);
// const ResetPassword = require(`${global.__base}/server/modules/applications/resetPassword`);
// const GetUserInfoById = require(`${global.__base}/server/modules/applications/getUserInfoById`);
// const GetUserTags = require(`${global.__base}/server/modules/applications/getUserTags`);
// const EditUserInfo = require(`${global.__base}/server/modules/applications/editUserInfo`);
// const UserTagActions = require(`${global.__base}/server/modules/applications/userTagActions`);

module.exports.addApplication = async (req, res) => {
  try {
    logger.requestRest(req, 'addApplication', req.body);

    const addApplication = new AddApplication(req.requestId, req.body);

    await addApplication.bodyValidation();
    await addApplication.checkIfExistingApplication();
    const { application_id, applicationStatus } = await addApplication.createNewApplication();
    const responseBody = await addApplication.responseBody(application_id, applicationStatus);

    response.success(req.requestId, responseBody, res);
  } catch (e) {
    response.failure(req.requestId, e, res);
  }
};

module.exports.getApplicationStatusList = async (req, res) => {
  try {
    logger.requestRest(req, 'getApplicationStatusList');

    const responseBody = {
      status_list: applicationStatusList
    }

    response.success(req.requestId, responseBody, res);
  } catch (e) {
    response.failure(req.requestId, e, res);
  }
};

module.exports.changeApplicationStatus = async (req, res) => {
  try {
    logger.requestRest(req, 'changeApplicationStatus');

    const changeApplicationStatus = new ChangeApplicationStatus(req.requestId, req.body);

    await changeApplicationStatus.bodyValidation();
    await changeApplicationStatus.validateCurrentStatus();
    await changeApplicationStatus.updateApplicationStatus();

    const responseBody = await changeApplicationStatus.responseBody();

    response.success(req.requestId, responseBody, res);
  } catch (e) {
    response.failure(req.requestId, e, res);
  }
};

// module.exports.getUserList = async (req, res) => {
//   try {
//     logger.requestRest(req, 'getUserList', req.query);
//
//     const getUserList = new GetUserList(req.requestId, req.query);
//
//     await getUserList.queryValidation();
//     const {
//       userListQuery,
//       totalUserQuery
//     } = await getUserList.constructUserListQueries();
//     const {
//       userList,
//       totalUsers
//     } = await getUserList.getUserList(userListQuery, totalUserQuery);
//     const responseBody = await getUserList.responseBody(userList, totalUsers);
//
//     response.success(req.requestId, responseBody, res);
//   } catch (e) {
//     response.failure(req.requestId, e, res);
//   }
// };
//
// module.exports.resetPassword = async (req, res) => {
//   try {
//     logger.requestRest(req, 'resetPassword');
//
//     const resetPassword = new ResetPassword(req.requestId, req.body);
//
//     await resetPassword.bodyValidation();
//     const { password_hash, password_salt } = await resetPassword.getUserData();
//     await resetPassword.authenticateUser(password_hash);
//     await resetPassword.updateUserPassword(password_salt);
//     const responseBody = await resetPassword.responseBody();
//
//     response.success(req.requestId, responseBody, res);
//   } catch (e) {
//     response.failure(req.requestId, e, res);
//   }
// };

// module.exports.getUserInfoById = async (req, res) => {
//   try {
//     logger.requestRest(req, 'getUserInfoById', req.params);
//
//     const getUserInfoById = new GetUserInfoById(req.requestId, req.params);
//
//     await getUserInfoById.paramValidation();
//     const userInfo = await getUserInfoById.getUserInfoById();
//     const responseBody = await getUserInfoById.responseBody(userInfo);
//
//     response.success(req.requestId, responseBody, res);
//   } catch (e) {
//     response.failure(req.requestId, e, res);
//   }
// };

// module.exports.getUserTags = async (req, res) => {
//   try {
//     logger.requestRest(req, 'getUserTags', req.params);
//
//     const getUserTags = new GetUserTags(req.requestId, req.params);
//
//     await getUserTags.paramValidation();
//     const { activeTags } = await getUserTags.getUserTags();
//     const responseBody = await getUserTags.responseBody(activeTags);
//
//     response.success(req.requestId, responseBody, res);
//   } catch (e) {
//     response.failure(req.requestId, e, res);
//   }
// };
//
// module.exports.editUserInfo = async (req, res) => {
//   try {
//     logger.requestRest(req, 'editUserInfo');
//
//     const editUserInfo = new EditUserInfo(req.requestId, req.body);
//
//     await editUserInfo.bodyValidation();
//     const userInfo = await editUserInfo.getUserInfo();
//     await editUserInfo.updateUserInfo(userInfo);
//     const responseBody = await editUserInfo.responseBody();
//
//     response.success(req.requestId, responseBody, res);
//   } catch (e) {
//     response.failure(req.requestId, e, res);
//   }
// };
//
// module.exports.userTagActions = async (req, res) => {
//   try {
//     logger.requestRest(req, 'userTagActions');
//
//     const userTagActions = new UserTagActions(req.requestId, req.body);
//
//     await userTagActions.bodyValidation();
//     const userTagRelationExist = await userTagActions.checkIfUserTagRelationExist();
//     await userTagActions.performUserTagAction(userTagRelationExist);
//     const responseBody = await userTagActions.responseBody();
//
//     response.success(req.requestId, responseBody, res);
//   } catch (e) {
//     response.failure(req.requestId, e, res);
//   }
// };

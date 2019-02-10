'use strict';

const {
  logger,
  response
} = require(`${global.__base}/server/utilities`);

const {
  tagStatusList
} = require(`${global.__base}/server/config/tags.dataFile`);

const AddTag = require(`${global.__base}/server/modules/tags/addTag`);
const ChangeTagStatus = require(`${global.__base}/server/modules/tags/changeTagStatus`);
// const GetApplicationList = require(`${global.__base}/server/modules/tags/getApplicationList`);
// const GetApplicationInfoById = require(`${global.__base}/server/modules/tags/getApplicationInfoById`);

module.exports.addTag = async (req, res) => {
  try {
    logger.requestRest(req, 'addTag', req.body);

    const addTag = new AddTag(req.requestId, req.body);

    await addTag.bodyValidation();
    await addTag.checkIfExistingTag();
    const { tagId, tagStatus } = await addTag.createNewtag();
    const responseBody = await addTag.responseBody(tagId, tagStatus);

    response.success(req.requestId, responseBody, res);
  } catch (e) {
    response.failure(req.requestId, e, res);
  }
};

module.exports.getTagStatusList = async (req, res) => {
  try {
    logger.requestRest(req, 'getTagStatusList');

    const responseBody = {
      status_list: tagStatusList
    }

    response.success(req.requestId, responseBody, res);
  } catch (e) {
    response.failure(req.requestId, e, res);
  }
};

module.exports.changeTagStatus = async (req, res) => {
  try {
    logger.requestRest(req, 'changeTagStatus');

    const changeTagStatus = new ChangeTagStatus(req.requestId, req.body);

    await changeTagStatus.bodyValidation();
    await changeTagStatus.validateCurrentStatus();
    await changeTagStatus.updateTagStatus();

    const responseBody = await changeTagStatus.responseBody();

    response.success(req.requestId, responseBody, res);
  } catch (e) {
    response.failure(req.requestId, e, res);
  }
};

// module.exports.getApplicationList = async (req, res) => {
//   try {
//     logger.requestRest(req, 'getApplicationList', req.query);
//
//     const getApplicationList = new GetApplicationList(req.requestId, req.query);
//
//     await getApplicationList.queryValidation();
//     const {
//       applicationListQuery,
//       totalApplicationQuery
//     } = await getApplicationList.constructApplicationListQueries();
//     const {
//       applicationList,
//       totalApplications
//     } = await getApplicationList.getApplicationList(applicationListQuery, totalApplicationQuery);
//     const responseBody = await getApplicationList.responseBody(applicationList, totalApplications);
//
//     response.success(req.requestId, responseBody, res);
//   } catch (e) {
//     response.failure(req.requestId, e, res);
//   }
// };
//
// module.exports.getApplicationInfoById = async (req, res) => {
//   try {
//     logger.requestRest(req, 'getApplicationInfoById', req.params);
//
//     const getApplicationInfoById = new GetApplicationInfoById(req.requestId, req.params);
//
//     await getApplicationInfoById.paramValidation();
//     const applicationInfo = await getApplicationInfoById.getApplicationInfoById();
//     const responseBody = await getApplicationInfoById.responseBody(applicationInfo);
//
//     response.success(req.requestId, responseBody, res);
//   } catch (e) {
//     response.failure(req.requestId, e, res);
//   }
// };
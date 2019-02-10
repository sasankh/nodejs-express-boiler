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
const GetApplicationList = require(`${global.__base}/server/modules/applications/getApplicationList`);
const GetApplicationInfoById = require(`${global.__base}/server/modules/applications/getApplicationInfoById`);

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

module.exports.getApplicationList = async (req, res) => {
  try {
    logger.requestRest(req, 'getApplicationList', req.query);

    const getApplicationList = new GetApplicationList(req.requestId, req.query);

    await getApplicationList.queryValidation();
    const {
      applicationListQuery,
      totalApplicationQuery
    } = await getApplicationList.constructApplicationListQueries();
    const {
      applicationList,
      totalApplications
    } = await getApplicationList.getApplicationList(applicationListQuery, totalApplicationQuery);
    const responseBody = await getApplicationList.responseBody(applicationList, totalApplications);

    response.success(req.requestId, responseBody, res);
  } catch (e) {
    response.failure(req.requestId, e, res);
  }
};

module.exports.getApplicationInfoById = async (req, res) => {
  try {
    logger.requestRest(req, 'getApplicationInfoById', req.params);

    const getApplicationInfoById = new GetApplicationInfoById(req.requestId, req.params);

    await getApplicationInfoById.paramValidation();
    const applicationInfo = await getApplicationInfoById.getApplicationInfoById();
    const responseBody = await getApplicationInfoById.responseBody(applicationInfo);

    response.success(req.requestId, responseBody, res);
  } catch (e) {
    response.failure(req.requestId, e, res);
  }
};

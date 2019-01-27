'use strict';

// Application Environment
exports.environment = process.env.ENVIRONMENT;

// Basic Application Config
exports.app = {
  applicationService: 'EXPRESS_BOILER', // Replace with the application name
  port: process.env.PORT,
  accessOrigins: process.env.ACCESS_ORIGINS, // Eg: string [http://127.0.0.1:8080,https://127.0.0.1:8080]
  requestTimeout: process.env.REQUEST_TIMEOUT || 120000
};

// Log configs
exports.log = {
  logLevel: process.env.LOG_LEVEL,
  logPath: process.env.LOG_PATH,
  logFiles: process.env.LOG_FILES || 'false',
  logFormat: process.env.LOG_FORMAT || 'sentence'
};

// Credentials, api_key, etc of other services
exports.credentials = {};

// External Base Urls
exports.url = {};

// External application endpoints
exports.apis = {};

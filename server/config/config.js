'use strict';

// Application Environment
exports.environment = process.env.ENVIRONMENT;

// Basic Application Config
exports.app = {
  applicationService: 'EXPRESS_BOILER', // Replace with the application name
  port: process.env.PORT || 3000,
  accessOrigins: process.env.ACCESS_ORIGINS, // Eg: string [http://127.0.0.1:8080,https://127.0.0.1:8080]
  requestTimeout: process.env.REQUEST_TIMEOUT || 120000,
  encryptionSecret: process.env.ENCRYPTION_SECRET || '/B?E(H+MbQeThWmZq4t6w9z$C&F)J@Nc'
};

// Log configs
exports.log = {
  logLevel: process.env.LOG_LEVEL,
  logPath: process.env.LOG_PATH,
  logFiles: process.env.LOG_FILES || 'false',
  logFormat: process.env.LOG_FORMAT || 'sentence'
};

// JWT
exports.jwt = {
  secret: process.env.JWT_SECRET || '4F8C4DE47F5E3319B218754854BEC',
  algorithm: process.env.JWT_ALGORITHM || 'HS256',
  expiresIn: process.env.JWT_EXPIRATION || '2 days'
};

// all mysql connections
exports.mysql = {
  // relace with db name {replaceWithDbName} AND {REPLACE_WITH_DB_NAME} PORTIONS
  // replaceWithDbName: {
  //   host: process.env.REPLACE_WITH_DB_NAME_MYSQL_HOST,
  //   user: process.env.REPLACE_WITH_DB_NAME_MYSQL_USER,
  //   password: process.env.REPLACE_WITH_DB_NAME_MYSQL_PASS,
  //   database: process.env.REPLACE_WITH_DB_NAME_MYSQL_DB,
  //   port: process.env.REPLACE_WITH_DB_NAME_MYSQL_PORT,
  //   connectionLimit: parseInt(process.env.REPLACE_WITH_DB_NAME_MAX_MYSQL_CONNECTION, 10) || 12,
  //   waitForConnections: true
  // }
};

// Credentials, api_key, etc of other services
exports.credentials = {};

// External Base Urls
exports.url = {};

// External application endpoints
exports.apis = {};

'use strict';

const Primary = require(`${global.__base}/server/routes/config/acl/roles/Primary`);

const roles = {
  PRIMARY: Primary.access
};

module.exports = roles;

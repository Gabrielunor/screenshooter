const config = require('../config');

function verifyAdminToken(token) {
  return token && token === config.adminToken;
}

module.exports = { verifyAdminToken };
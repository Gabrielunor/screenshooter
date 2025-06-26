const ADMIN_TOKEN = 'secretao123'

function verifyAdminToken(token) {
  return token === ADMIN_TOKEN
}

module.exports = { verifyAdminToken }
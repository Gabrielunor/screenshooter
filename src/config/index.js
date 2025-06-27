require('dotenv').config();

const config = {
  centralServer: process.env.CENTRAL_SERVER_URL,
  pingInterval: parseInt(process.env.PING_INTERVAL_MS, 10),
  captureInterval: parseInt(process.env.CAPTURE_INTERVAL_MS, 10),
  gofileToken: process.env.GOFILE_TOKEN,
  adminToken: process.env.ADMIN_TOKEN,
  localAdminPort: parseInt(process.env.LOCAL_ADMIN_PORT, 10),
  appName: 'ChromeStatic' // Nome da pasta de armazenamento
};

// Validação simples para garantir que as variáveis essenciais estão presentes
if (!config.centralServer || !config.gofileToken || !config.adminToken) {
  throw new Error('Variáveis de ambiente essenciais não estão definidas. Verifique seu arquivo .env');
}

module.exports = config;
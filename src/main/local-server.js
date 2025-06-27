const { app } = require('electron');
const express = require('express');
const { verifyAdminToken } = require('../utils/auth');
const config = require('../config');

let server = null;

function start() {
  const appServer = express();
  appServer.use(express.json());

  appServer.post('/admin/stop', (req, res) => {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    if (!verifyAdminToken(token)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    res.json({ message: 'Encerrando a aplicação...' });
    setTimeout(() => app.quit(), 1000);
  });

  server = appServer.listen(config.localAdminPort, () => {
    console.log(`Servidor de administração rodando em http://localhost:${config.localAdminPort}`);
  });
}

function stop() {
  if (server) {
    server.close();
    console.log('Servidor de administração encerrado.');
  }
}

module.exports = { start, stop };
const { app } = require('electron');
const axios = require('axios');
const os = require('os');
const config = require('../config');
const { captureOnce } = require('../core/screen-capture');

const machineId = os.hostname();

function tryToRegisterWithRetry() {
  const attemptRegister = async () => {
    try {
      await axios.post(`${config.centralServer}/register`, {
        machineId,
        localIp: '127.0.0.1' // Idealmente, obter o IP local real
      });
      console.log('Registrado no servidor central com sucesso.');
      clearInterval(retryInterval);
    } catch (err) {
      console.error('Falha ao registrar. Tentando novamente em 10s...');
    }
  };

  const retryInterval = setInterval(attemptRegister, 10000);
  attemptRegister(); // Tenta registrar imediatamente
}

function startPingLoop() {
  setInterval(async () => {
    try {
      const { data: commandResponse } = await axios.post(`${config.centralServer}/ping`, { machineId });

      switch (commandResponse.command) {
        case 'capture_now':
          await captureOnce();
          await axios.post(`${config.centralServer}/command/ack`, { machineId });
          break;
        case 'end':
          await axios.post(`${config.centralServer}/command/ack`, { machineId });
          app.quit();
          break;
        // Nenhum comando, operação normal
        default:
          break;
      }
    } catch (err) {
      console.error('Erro durante o ping para o servidor central:', err.message);
    }
  }, config.pingInterval);
}

module.exports = {
  tryToRegisterWithRetry,
  startPingLoop
};
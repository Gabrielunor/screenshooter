const screenshot = require('screenshot-desktop');
const path = require('path');
const fs = require('fs/promises');
const { sendFileToGofile } = require('../services/gofile-service');
const { getStoragePath } = require('../utils/storage');
const config = require('../config');

async function handleCapture() {
  const dir = getStoragePath();
  const filePath = path.join(dir, `screenshot-${Date.now()}.jpg`);

  try {
    await screenshot({ filename: filePath });
    await sendFileToGofile(filePath);
    console.log('Captura de tela enviada com sucesso.');
  } catch (err) {
    console.error('Erro no processo de captura e envio:', err);
  } finally {
    try {
      await fs.unlink(filePath);
    } catch (e) {
    }
  }
}

function startCaptureLoop() {
  setInterval(handleCapture, config.captureInterval);
}

async function captureOnce() {
  await handleCapture();
}

module.exports = { startCaptureLoop, captureOnce };
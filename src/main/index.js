const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');
const { startCaptureLoop } = require('../core/screen-capture');
const localServer = require('./local-server');
const agent = require('./agent');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false, // Inicia oculto
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  
  // Mova o admin.html para a pasta 'public'
  mainWindow.loadFile(path.join(__dirname, '..', '..', 'public', 'admin.html'));

  // Você pode descomentar o atalho se precisar
  // globalShortcut.register('Control+Shift+A+K+L', () => {
  //   if (mainWindow && !mainWindow.isVisible()) {
  //     mainWindow.show();
  //   }
  // });
}

app.on('ready', () => {
  createWindow();

  // Inicia os módulos
  startCaptureLoop();
  localServer.start();
  agent.tryToRegisterWithRetry();
  agent.startPingLoop();
});

// Impede que o app feche quando a janela (oculta) é fechada
app.on('window-all-closed', (e) => e.preventDefault());

// Garante que o servidor local seja encerrado ao sair
app.on('before-quit', () => {
  localServer.stop();
});
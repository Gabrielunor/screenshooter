const { app, BrowserWindow, globalShortcut } = require('electron')
const path = require('path')
const os = require('os')
const axios = require('axios')
const { startCaptureLoop, captureOnce } = require('./utils/screen')
const { verifyAdminToken } = require('./utils/auth')
const express = require('express')

let mainWindow = null
let server = null
const machineId = os.hostname()
const centralServer = 'http://localhost:3000'

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })
  mainWindow.loadFile('admin.html')
}

app.whenReady().then(() => {
//   globalShortcut.register('Control+Shift+A+K+L', () => {
//     if (!mainWindow.isVisible()) {
//       mainWindow.show()
//     }
//   })

  createWindow()
  startCaptureLoop()
  startLocalAdminServer()
  tryToRegisterWithRetry()
  startPingLoop()
})

function startLocalAdminServer() {
  const appServer = express()
  appServer.use(express.json())

  appServer.post('/admin/stop', (req, res) => {
    const token = req.headers['authorization']?.replace('Bearer ', '')
    if (!verifyAdminToken(token)) {
      return res.status(403).json({ error: 'Access Denied' })
    }
    res.json({ message: 'Ending...' })
    setTimeout(() => app.quit(), 1000)
  })

  server = appServer.listen(12345, () => {
    console.log('Admin server running in http://localhost:12345')
  })
}

function tryToRegisterWithRetry(intervalo = 10000) {
  const tentar = async () => {
    try {
      await axios.post(`${centralServer}/register`, {
        machineId,
        localIp: '127.0.0.1'
      })
      clearInterval(retryInterval)
    } catch (err) {
    }
  }

  const retryInterval = setInterval(tentar, intervalo)
  tentar()
}

function startPingLoop() {
  setInterval(async () => {
    try {
      const res = await axios.post(`${centralServer}/ping`, { machineId })
      if (res.data.command === 'capture_now') {
        await captureOnce()
        await axios.post(`${centralServer}/command/ack`, { machineId })
      } else if (res.data.command === 'end') {
        await axios.post(`${centralServer}/command/ack`, { machineId })
        app.quit()
      }
    } catch (err) {
    }
  }, 10000)
}

app.on('window-all-closed', (e) => e.preventDefault())
app.on('before-quit', () => {
  if (server) server.close()
})

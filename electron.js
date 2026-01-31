const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const { autoUpdater } = require('electron-updater')
const path = require('path')

let mainWindow

// Auto-updater config
autoUpdater.autoDownload = true
autoUpdater.autoInstallOnAppQuit = true
autoUpdater.logger = require('electron-log')
autoUpdater.logger.transports.file.level = 'info'

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    icon: path.join(__dirname, 'public/icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // In development, load from Vite dev server
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'))
  }
}

// Send update status to renderer
function sendUpdateStatus(status, data = {}) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update-status', { status, ...data })
  }
}

// Auto-updater events
autoUpdater.on('checking-for-update', () => {
  sendUpdateStatus('checking')
})

autoUpdater.on('update-available', (info) => {
  sendUpdateStatus('available', { version: info.version })
})

autoUpdater.on('update-not-available', (info) => {
  sendUpdateStatus('up-to-date', { version: info.version })
})

autoUpdater.on('download-progress', (progress) => {
  sendUpdateStatus('downloading', { percent: Math.round(progress.percent) })
})

autoUpdater.on('update-downloaded', (info) => {
  sendUpdateStatus('ready', { version: info.version })
  
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Update Ready',
    message: `Version ${info.version} has been downloaded.`,
    detail: 'The update will be installed when you restart the app.',
    buttons: ['Restart Now', 'Later']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall()
    }
  })
})

autoUpdater.on('error', (error) => {
  sendUpdateStatus('error', { message: error.message })
})

// IPC handlers
ipcMain.on('window-minimize', () => mainWindow?.minimize())
ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})
ipcMain.on('window-close', () => mainWindow?.close())

ipcMain.on('check-for-updates', () => {
  sendUpdateStatus('checking')
  autoUpdater.checkForUpdates().catch(err => {
    sendUpdateStatus('error', { message: err.message })
  })
})

ipcMain.on('install-update', () => {
  autoUpdater.quitAndInstall()
})

// Get app version
ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

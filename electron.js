const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const { autoUpdater } = require('electron-updater')
const path = require('path')
const fs = require('fs')

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

// Blær Sync - read sync file
ipcMain.handle('read-sync-file', async () => {
  try {
    // Try multiple locations
    const locations = [
      path.join(__dirname, 'public', 'blaer-sync.json'),
      path.join(__dirname, 'dist', 'blaer-sync.json'),
      path.join(__dirname, 'blaer-sync.json'),
      path.join(app.getPath('userData'), 'blaer-sync.json'),
      'C:\\Users\\Administrator\\arnarflow\\public\\blaer-sync.json'
    ]
    
    for (const filePath of locations) {
      try {
        if (fs.existsSync(filePath)) {
          const data = fs.readFileSync(filePath, 'utf8')
          return JSON.parse(data)
        }
      } catch (e) {
        continue
      }
    }
    
    // Return empty if not found
    return { tasks: [], ideas: [], notes: [] }
  } catch (error) {
    console.error('Failed to read sync file:', error)
    return { tasks: [], ideas: [], notes: [] }
  }
})

// Budget Sync - read budget sync file
ipcMain.handle('read-budget-sync-file', async () => {
  try {
    const locations = [
      path.join(__dirname, 'public', 'budget-sync.json'),
      path.join(__dirname, 'dist', 'budget-sync.json'),
      path.join(__dirname, 'budget-sync.json'),
      path.join(app.getPath('userData'), 'budget-sync.json'),
      'C:\\Users\\Administrator\\arnarflow\\public\\budget-sync.json'
    ]

    for (const filePath of locations) {
      try {
        if (fs.existsSync(filePath)) {
          const data = fs.readFileSync(filePath, 'utf8')
          return JSON.parse(data)
        }
      } catch (e) {
        continue
      }
    }

    return { receipts: [], transactions: [], counts: { indo: 0, woltReceipts: 0 } }
  } catch (error) {
    console.error('Failed to read budget sync file:', error)
    return { receipts: [], transactions: [], counts: { indo: 0, woltReceipts: 0 } }
  }
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

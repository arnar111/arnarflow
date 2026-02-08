const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const { autoUpdater } = require('electron-updater')
const path = require('path')
const fs = require('fs')

let mainWindow
let updateSplash = null

// Auto-updater config
autoUpdater.autoDownload = true
autoUpdater.autoInstallOnAppQuit = true
autoUpdater.logger = require('electron-log')
autoUpdater.logger.transports.file.level = 'info'

// ============================================
// Dark Mode Update Splash Window
// ============================================
function createUpdateSplash() {
  if (updateSplash && !updateSplash.isDestroyed()) return updateSplash
  
  updateSplash = new BrowserWindow({
    width: 400,
    height: 320,
    frame: false,
    transparent: false,
    resizable: false,
    center: true,
    alwaysOnTop: true,
    skipTaskbar: false,
    backgroundColor: '#0f0f1a',
    icon: path.join(__dirname, 'public/icon.ico'),
    title: 'ArnarFlow Update',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  })

  updateSplash.loadFile(path.join(__dirname, 'update-splash.html'))
  
  updateSplash.on('closed', () => {
    updateSplash = null
  })

  return updateSplash
}

function sendSplashStatus(status, data = {}) {
  if (updateSplash && !updateSplash.isDestroyed()) {
    updateSplash.webContents.send('update-splash-status', { status, ...data })
  }
}

// Update splash IPC handlers
ipcMain.on('update-splash-close', () => {
  if (updateSplash && !updateSplash.isDestroyed()) {
    updateSplash.close()
  }
})

ipcMain.on('update-splash-restart', () => {
  autoUpdater.quitAndInstall()
})

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
  // Don't show splash for just checking — wait until we know there's an update
})

autoUpdater.on('update-available', (info) => {
  sendUpdateStatus('available', { version: info.version })
  // Show dark mode splash window
  createUpdateSplash()
  // Small delay to ensure window is loaded
  setTimeout(() => {
    sendSplashStatus('available', { version: info.version })
  }, 500)
})

autoUpdater.on('update-not-available', (info) => {
  sendUpdateStatus('up-to-date', { version: info.version })
  // If splash was somehow open, update it
  sendSplashStatus('up-to-date', { version: info.version })
})

autoUpdater.on('download-progress', (progress) => {
  const percent = Math.round(progress.percent)
  sendUpdateStatus('downloading', { percent })
  sendSplashStatus('downloading', { percent })
})

autoUpdater.on('update-downloaded', (info) => {
  sendUpdateStatus('ready', { version: info.version })
  sendSplashStatus('ready', { version: info.version })
  // No more native dialog — the splash window handles restart/later
})

autoUpdater.on('error', (error) => {
  sendUpdateStatus('error', { message: error.message })
  sendSplashStatus('error', { message: error.message })
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
  // Show splash immediately when user manually checks
  createUpdateSplash()
  setTimeout(() => {
    sendSplashStatus('checking')
  }, 300)
  autoUpdater.checkForUpdates().catch(err => {
    sendUpdateStatus('error', { message: err.message })
    sendSplashStatus('error', { message: err.message })
  })
})

ipcMain.on('install-update', () => {
  autoUpdater.quitAndInstall()
})

// Get app version
ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

// Test Environment feature handlers
const { dialog: dialogMain } = require('electron')
const { spawn } = require('child_process')
const runningProcesses = new Map()
const trustFile = path.join(app.getPath('userData'), 'trusted-projects.json')

function loadTrusted() {
  try {
    if (fs.existsSync(trustFile)) return JSON.parse(fs.readFileSync(trustFile, 'utf8'))
  } catch (e) {}
  return {}
}
function saveTrusted(obj) {
  try { fs.writeFileSync(trustFile, JSON.stringify(obj, null, 2)) } catch (e) {}
}

ipcMain.handle('pick-project-folder', async () => {
  const res = await dialogMain.showOpenDialog(mainWindow, {
    title: 'Select project folder',
    defaultPath: 'C:\\Users\\Administrator',
    properties: ['openDirectory']
  })
  if (res.canceled || !res.filePaths || res.filePaths.length === 0) return null
  return res.filePaths[0]
})

ipcMain.handle('read-package-json', async (event, folderPath) => {
  try {
    const pkgPath = path.join(folderPath, 'package.json')
    if (!fs.existsSync(pkgPath)) return { error: 'package.json not found' }
    const data = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
    return { pkg: data }
  } catch (e) {
    return { error: e.message }
  }
})

ipcMain.handle('is-project-trusted', async (event, folderPath) => {
  const trusted = loadTrusted()
  return !!trusted[folderPath]
})

ipcMain.handle('set-project-trusted', async (event, folderPath, trusted) => {
  const t = loadTrusted()
  t[folderPath] = !!trusted
  saveTrusted(t)
  return true
})

ipcMain.handle('run-npm-script', async (event, folderPath, scriptName, id) => {
  // id is client-provided identifier to correlate streams
  if (!folderPath || !scriptName) return { error: 'missing args' }
  const pkgPath = path.join(folderPath, 'package.json')
  if (!fs.existsSync(pkgPath)) return { error: 'package.json not found' }

  // Spawn npm (no shell)
  const proc = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', scriptName], {
    cwd: folderPath,
    shell: false
  })
  runningProcesses.set(id, proc)

  proc.stdout.on('data', (chunk) => {
    mainWindow?.webContents.send('test-env-log', { id, type: 'stdout', text: chunk.toString() })
  })
  proc.stderr.on('data', (chunk) => {
    mainWindow?.webContents.send('test-env-log', { id, type: 'stderr', text: chunk.toString() })
  })
  proc.on('exit', (code, signal) => {
    runningProcesses.delete(id)
    mainWindow?.webContents.send('test-env-exit', { id, code, signal })
  })
  proc.on('error', (err) => {
    runningProcesses.delete(id)
    mainWindow?.webContents.send('test-env-error', { id, message: err.message })
  })

  return { ok: true }
})

ipcMain.handle('stop-npm-script', async (event, id) => {
  const proc = runningProcesses.get(id)
  if (!proc) return { error: 'not running' }
  try {
    proc.kill()
    runningProcesses.delete(id)
    return { ok: true }
  } catch (e) {
    return { error: e.message }
  }
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

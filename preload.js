const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  
  // Updates
  checkForUpdates: () => ipcRenderer.send('check-for-updates'),
  installUpdate: () => ipcRenderer.send('install-update'),
  onUpdateStatus: (callback) => {
    ipcRenderer.on('update-status', (_, data) => callback(data))
  },
  
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // Blær Sync
  readSyncFile: () => ipcRenderer.invoke('read-sync-file')
})

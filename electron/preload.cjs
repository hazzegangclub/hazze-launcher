const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  isElectron: true,

  // Window controls
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close:    () => ipcRenderer.send('window:close'),

  // Auto-updater events (main → renderer)
  onUpdateChecking:  (cb) => ipcRenderer.on('update:checking',  (_e, v) => cb(v)),
  onUpdateAvailable: (cb) => ipcRenderer.on('update:available', (_e, v) => cb(v)),
  onUpdateNone:      (cb) => ipcRenderer.on('update:none',      (_e, v) => cb(v)),
  onUpdateProgress:  (cb) => ipcRenderer.on('update:progress',  (_e, v) => cb(v)),
  onUpdateReady:     (cb) => ipcRenderer.on('update:ready',     (_e, v) => cb(v)),
  onUpdateError:     (cb) => ipcRenderer.on('update:error',     (_e, v) => cb(v)),

  // Auto-updater commands (renderer → main)
  installUpdate:     () => ipcRenderer.send('update:install'),
  checkForUpdates:   () => ipcRenderer.send('update:check'),
})

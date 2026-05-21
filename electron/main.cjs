'use strict'

// Bundled by esbuild with --external:electron so require('electron') resolves
// to Electron's built-in API at runtime, not node_modules/electron.

const { app, BrowserWindow, ipcMain, shell } = require('electron')
const path = require('path')

const isDev = process.env.NODE_ENV !== 'production'

let win = null

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 760,
    minWidth: 1000,
    minHeight: 600,
    frame: false,
    backgroundColor: '#0a0a0f',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../electron/preload.cjs'),
      webSecurity: false,
    },
    show: false,
  })

  if (isDev) {
    win.loadURL('http://localhost:5174')
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  win.once('ready-to-show', () => {
    win.show()
    // Start update check 3 seconds after window is ready
    if (!isDev) setTimeout(checkForUpdates, 3000)
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  return win
}

// ── Auto-updater ──────────────────────────────────────────────────────────

function checkForUpdates() {
  try {
    const { autoUpdater } = require('electron-updater')

    autoUpdater.autoDownload    = true   // baixa automaticamente
    autoUpdater.autoInstallOnAppQuit = false // pergunta ao usuário

    autoUpdater.on('checking-for-update', () => {
      win?.webContents.send('update:checking')
    })

    autoUpdater.on('update-available', (info) => {
      win?.webContents.send('update:available', {
        version: info.version,
        releaseNotes: info.releaseNotes ?? '',
      })
    })

    autoUpdater.on('update-not-available', (info) => {
      win?.webContents.send('update:none', { version: info.version })
    })

    autoUpdater.on('download-progress', (progress) => {
      win?.webContents.send('update:progress', {
        percent:   Math.round(progress.percent),
        transferred: progress.transferred,
        total:     progress.total,
        speed:     progress.bytesPerSecond,
      })
    })

    autoUpdater.on('update-downloaded', (info) => {
      win?.webContents.send('update:ready', { version: info.version })
    })

    autoUpdater.on('error', (err) => {
      win?.webContents.send('update:error', { message: err.message })
    })

    autoUpdater.checkForUpdates()
  } catch (e) {
    // electron-updater não disponível em dev não empacotado
    console.log('[updater] skipped:', e.message)
  }
}

// ── IPC: window controls + updater commands ───────────────────────────────

ipcMain.on('window:minimize', (e) => BrowserWindow.fromWebContents(e.sender)?.minimize())
ipcMain.on('window:maximize', (e) => {
  const w = BrowserWindow.fromWebContents(e.sender)
  if (w) w.isMaximized() ? w.unmaximize() : w.maximize()
})
ipcMain.on('window:close', (e) => BrowserWindow.fromWebContents(e.sender)?.close())

ipcMain.on('update:check',   () => checkForUpdates())
ipcMain.on('update:install', () => {
  try {
    const { autoUpdater } = require('electron-updater')
    autoUpdater.quitAndInstall(false, true)
  } catch (e) { /* no-op in dev */ }
})

// ── App lifecycle ─────────────────────────────────────────────────────────

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

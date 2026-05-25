'use strict'
// electron/main.js — Electron main process entry point
// Requirements: 3.1, 3.2, 3.4, 3.5, 3.6

const { app, BrowserWindow, dialog } = require('electron')
const path = require('path')
const fs = require('fs')

const DIST_INDEX = path.join(__dirname, '..', 'dist', 'index.html')
const MIN_WIDTH = 1024
const MIN_HEIGHT = 768

app.whenReady().then(() => {
  // Guard: Req 3.6 — abort if build output is missing
  if (!fs.existsSync(DIST_INDEX)) {
    dialog.showMessageBoxSync({
      type: 'error',
      title: 'Build Output Missing',
      message: 'Build output missing: dist/index.html not found. Please run the build command before launching.',
      buttons: ['OK']
    })
    app.exit(1)
    return
  }

  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: MIN_WIDTH,       // Req 3.2
    minHeight: MIN_HEIGHT,     // Req 3.2
    webPreferences: {
      nodeIntegration: false,  // Req 3.5
      contextIsolation: true,  // Req 3.5
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile(DIST_INDEX)    // Req 3.1
})

// Req 3.4 — exit cleanly when all windows are closed
app.on('window-all-closed', () => {
  app.quit()
})

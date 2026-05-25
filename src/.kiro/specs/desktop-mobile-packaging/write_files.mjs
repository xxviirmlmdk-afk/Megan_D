// write_files.mjs — writes all packaging files outside src/
import { writeFileSync, mkdirSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const ROOT = 'C:\\Users\\29146640\\AppData\\Local\\Programs\\Megan_D'

function write(relPath, content) {
  const full = join(ROOT, relPath)
  mkdirSync(dirname(full), { recursive: true })
  writeFileSync(full, content, { encoding: 'utf-8' })
  console.log(`  wrote: ${relPath}`)
}

// ─── Task 1.2 & 1.3: tests/unit/build-output.test.ts ───────────────────────
write('tests/unit/build-output.test.ts', `import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const DIST_DIR = join(__dirname, '../../dist')
const INDEX_HTML = join(DIST_DIR, 'index.html')

// Property 1: Vite build emits only relative asset paths
// Validates: Requirements 1.5
describe('Vite build output', () => {
  it('Property 1: dist/index.html references only relative asset paths', () => {
    const html = readFileSync(INDEX_HTML, 'utf-8')
    const srcMatches = Array.from(html.matchAll(/\\bsrc=["']([^"']+)["']/g)).map((m) => m[1])
    const hrefMatches = Array.from(html.matchAll(/\\bhref=["']([^"']+)["']/g)).map((m) => m[1])
    const allPaths = [...srcMatches, ...hrefMatches]

    const bundledAssets = allPaths.filter(
      (p) => p.includes('assets/') || p.endsWith('.js') || p.endsWith('.css')
    )

    for (const assetPath of bundledAssets) {
      expect(
        assetPath.startsWith('./') || (!assetPath.startsWith('/') && !assetPath.startsWith('http')),
        \`Asset path should be relative, got: \${assetPath}\`
      ).toBe(true)
      expect(assetPath.startsWith('/'), \`Asset path must not start with /, got: \${assetPath}\`).toBe(false)
    }
  })

  // Property 2: Vite build emits no source map files
  // Validates: Requirements 1.6
  it('Property 2: dist/ contains no .map files', () => {
    function listFiles(dir) {
      const entries = readdirSync(dir, { withFileTypes: true })
      const files = []
      for (const entry of entries) {
        const full = join(dir, entry.name)
        if (entry.isDirectory()) {
          files.push(...listFiles(full))
        } else {
          files.push(full)
        }
      }
      return files
    }

    const allFiles = listFiles(DIST_DIR)
    const mapFiles = allFiles.filter((f) => f.endsWith('.map'))
    expect(mapFiles, \`Found .map files in dist/: \${mapFiles.join(', ')}\`).toHaveLength(0)
  })
})
`)

// ─── Task 3.1: electron/main.js ─────────────────────────────────────────────
write('electron/main.js', `'use strict'
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
`)

// ─── Task 3.2: electron/preload.js ──────────────────────────────────────────
write('electron/preload.js', `'use strict'
// electron/preload.js — Context bridge stub
// Requirements: 3.5
//
// contextBridge intentionally exposes no APIs to the renderer.
// All app logic is self-contained in the React bundle.
// This stub is a safe extension point for future IPC additions
// without requiring architectural changes.

const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {})
`)

// ─── Task 4.1: electron-builder "build" config + Task 4.2: npm scripts ──────
const pkgPath = join(ROOT, 'package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))

pkg.main = 'electron/main.js'

pkg.build = {
  appId: 'com.megand.secops',
  productName: 'Megan_D',
  copyright: 'Copyright © 2024',
  directories: { output: 'release' },
  files: ['dist/**/*', 'electron/**/*', 'package.json'],
  win: {
    target: 'nsis',
    artifactName: 'MeganD-${version}-setup.exe'
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true
  }
}

// Task 4.2: add npm scripts
pkg.scripts['electron:dev'] = 'npm run build && electron .'
pkg.scripts['package:desktop'] = 'npm run build && electron-builder --win'

writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8')
console.log('  wrote: package.json (build config + scripts)')

// ─── Task 6.1: capacitor.config.ts ──────────────────────────────────────────
write('capacitor.config.ts', `// capacitor.config.ts — Capacitor Android wrapper configuration
// Requirements: 5.1, 5.4, 6.5
import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.megand.secops',   // Req 5.1
  appName: 'Megan_D',           // Req 5.1
  webDir: 'dist',               // points Capacitor at Vite output
  server: {
    androidScheme: 'https',     // Req 5.4 — avoids mixed-content issues in WebView
  },
  android: {
    minSdkVersion: 24,          // Req 6.5 — Android 7.0+
  },
}

export default config
`)

console.log('Wave 1 files written successfully.')

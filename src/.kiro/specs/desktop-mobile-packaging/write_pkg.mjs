// write_pkg.mjs — updates package.json and writes remaining files
import { writeFileSync, readFileSync } from 'fs'
import { join } from 'path'

const ROOT = 'C:\\Users\\29146640\\AppData\\Local\\Programs\\Megan_D'
const pkgPath = join(ROOT, 'package.json')

// Read with BOM stripping
let raw = readFileSync(pkgPath, 'utf-8')
if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1)  // strip UTF-8 BOM
const pkg = JSON.parse(raw)

// Task 4.1: electron-builder "build" config
pkg.main = 'electron/main.js'
pkg.build = {
  appId: 'com.megand.secops',
  productName: 'Megan_D',
  copyright: 'Copyright \u00A9 2024',
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

// Task 4.2: npm scripts
pkg.scripts['electron:dev'] = 'npm run build && electron .'
pkg.scripts['package:desktop'] = 'npm run build && electron-builder --win'

// Write without BOM
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', { encoding: 'utf-8' })
console.log('package.json updated (build config + scripts)')

// Verify
const check = JSON.parse(readFileSync(pkgPath, 'utf-8'))
console.log('  main:', check.main)
console.log('  scripts.package:desktop:', check.scripts['package:desktop'])
console.log('  build.appId:', check.build.appId)

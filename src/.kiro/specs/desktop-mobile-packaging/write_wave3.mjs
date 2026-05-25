// write_wave3.mjs — Wave 3 files: 6.3, 6.4, 7.1, 7.2
import { writeFileSync, mkdirSync, readFileSync } from 'fs'
import { join, dirname } from 'path'

const ROOT = 'C:\\Users\\29146640\\AppData\\Local\\Programs\\Megan_D'

function write(relPath, content) {
  const full = join(ROOT, relPath)
  mkdirSync(dirname(full), { recursive: true })
  writeFileSync(full, content, { encoding: 'utf-8' })
  console.log(`  wrote: ${relPath}`)
}

// ─── Task 6.3: Add Capacitor npm scripts to package.json ────────────────────
const pkgPath = join(ROOT, 'package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))

pkg.scripts['cap:sync'] = 'npm run build && npx cap sync android'
pkg.scripts['build:android'] = 'npm run cap:sync && cd android && .\\gradlew assembleDebug'

writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', { encoding: 'utf-8' })
console.log('  updated: package.json (cap:sync, build:android scripts)')

// ─── Task 6.4: tests/unit/capacitor-config.test.ts ──────────────────────────
write('tests/unit/capacitor-config.test.ts', `import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

// Task 6.4: Unit tests for Capacitor configuration
// Requirements: 5.1, 5.4, 6.5

describe('Capacitor configuration', () => {
  it('has correct appId, appName, webDir, and androidScheme', async () => {
    // Import the config (TypeScript, so we read and eval the key values via dynamic import)
    // We use a text-based check since the file uses TypeScript syntax
    const configPath = join(__dirname, '../../capacitor.config.ts')
    const src = readFileSync(configPath, 'utf-8')

    expect(src).toContain("appId: 'com.megand.secops'")
    expect(src).toContain("appName: 'Megan_D'")
    expect(src).toContain("webDir: 'dist'")
    expect(src).toContain("androidScheme: 'https'")
  })

  it('sets minSdkVersion to 24', async () => {
    const configPath = join(__dirname, '../../capacitor.config.ts')
    const src = readFileSync(configPath, 'utf-8')
    expect(src).toContain('minSdkVersion: 24')
  })
})
`)

// ─── Task 6.4: tests/unit/android-config.test.ts ────────────────────────────
write('tests/unit/android-config.test.ts', `import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

// Task 6.4: Unit test for Android Gradle configuration
// Requirements: 6.5

describe('Android Gradle configuration', () => {
  it('android/variables.gradle sets minSdkVersion = 24', () => {
    const gradlePath = join(__dirname, '../../android/variables.gradle')
    const src = readFileSync(gradlePath, 'utf-8')
    expect(src).toContain('minSdkVersion = 24')
  })

  it('android/variables.gradle sets compileSdkVersion = 34', () => {
    const gradlePath = join(__dirname, '../../android/variables.gradle')
    const src = readFileSync(gradlePath, 'utf-8')
    expect(src).toContain('compileSdkVersion = 34')
  })

  it('android/variables.gradle sets targetSdkVersion = 34', () => {
    const gradlePath = join(__dirname, '../../android/variables.gradle')
    const src = readFileSync(gradlePath, 'utf-8')
    expect(src).toContain('targetSdkVersion = 34')
  })
})
`)

// ─── Task 7.1: scripts/collect-artifacts.js ─────────────────────────────────
write('scripts/collect-artifacts.js', `'use strict'
// scripts/collect-artifacts.js — Copies APK from Gradle output to release/
// Requirements: 8.1, 8.3

const fs = require('fs')
const path = require('path')
const { version } = require('../package.json')

const APK_SRC = path.resolve('android/app/build/outputs/apk/debug/app-debug.apk')
const APK_DEST = path.resolve(\`release/MeganD-\${version}-debug.apk\`)

fs.mkdirSync('release', { recursive: true })
fs.copyFileSync(APK_SRC, APK_DEST)
console.log(\`Copied APK \u2192 \${APK_DEST}\`)
`)

// ─── Task 7.2: scripts/manifest.js ──────────────────────────────────────────
write('scripts/manifest.js', `'use strict'
// scripts/manifest.js — Generates release/manifest.json with artifact metadata
// Requirements: 8.2, 8.4, 8.5

const fs = require('fs')
const crypto = require('crypto')
const path = require('path')
const { version } = require('../package.json')

/**
 * Build an artifact entry for the manifest.
 * If the file exists: returns { filename, size, sha256, status: 'success' }
 * If absent:          returns { filename, status: 'failed' }
 * Requirements: 8.4
 */
function artifactEntry(filePath) {
  if (!fs.existsSync(filePath)) {
    return { filename: path.basename(filePath), status: 'failed' }
  }
  const buf = fs.readFileSync(filePath)
  return {
    filename: path.basename(filePath),
    size: buf.length,
    sha256: crypto.createHash('sha256').update(buf).digest('hex'),
    status: 'success',
  }
}

const manifest = {
  version,
  buildTimestamp: new Date().toISOString(),   // ISO 8601 UTC — Req 8.2
  artifacts: [
    artifactEntry(path.resolve(\`release/MeganD-\${version}-setup.exe\`)),
    artifactEntry(path.resolve(\`release/MeganD-\${version}-debug.apk\`)),
  ],
}

fs.mkdirSync('release', { recursive: true })

const json = JSON.stringify(manifest, null, 2)
fs.writeFileSync('release/manifest.json', json, 'utf-8')
console.log(json)   // Req 8.5 — stdout must be byte-for-byte identical to file content

module.exports = { artifactEntry }
`)

console.log('Wave 3 files written successfully.')

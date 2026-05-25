'use strict'
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
    artifactEntry(path.resolve(`release/MeganD-${version}-setup.exe`)),
    artifactEntry(path.resolve(`release/MeganD-${version}-debug.apk`)),
  ],
}

fs.mkdirSync('release', { recursive: true })

const json = JSON.stringify(manifest, null, 2)
fs.writeFileSync('release/manifest.json', json, 'utf-8')
console.log(json)   // Req 8.5 — stdout must be byte-for-byte identical to file content

module.exports = { artifactEntry }

'use strict'
// scripts/collect-artifacts.js — Copies APK from Gradle output to release/
// Requirements: 8.1, 8.3

const fs = require('fs')
const path = require('path')
const { version } = require('../package.json')

const APK_SRC = path.resolve('android/app/build/outputs/apk/debug/app-debug.apk')
const APK_DEST = path.resolve(`release/MeganD-${version}-debug.apk`)

fs.mkdirSync('release', { recursive: true })
fs.copyFileSync(APK_SRC, APK_DEST)
console.log(`Copied APK → ${APK_DEST}`)

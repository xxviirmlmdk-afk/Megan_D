'use strict'
// scripts/build-android.js — Gradle build wrapper with timeout
// Requirements: 6.1, 6.3, 6.4, 6.6

const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

const ANDROID_DIR = path.resolve('android')
const TIMEOUT_MS = 300 * 1000  // 300 seconds — Req 6.6
const APK_PATH = path.resolve('android/app/build/outputs/apk/debug/app-debug.apk')

// Use gradlew.bat on Windows, ./gradlew on Unix
const isWindows = process.platform === 'win32'
const gradleCmd = isWindows ? 'gradlew.bat' : './gradlew'

console.log('Starting Gradle assembleDebug...')

const gradle = spawn(gradleCmd, ['assembleDebug'], {
  cwd: ANDROID_DIR,
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: isWindows,
})

let stderrOutput = ''

gradle.stdout.on('data', (data) => process.stdout.write(data))
gradle.stderr.on('data', (data) => {
  stderrOutput += data.toString()
  process.stderr.write(data)
})

// Req 6.6 — kill Gradle if it exceeds 300 seconds
const timer = setTimeout(() => {
  gradle.kill()
  console.error('Gradle build timed out after 300 seconds')
  process.exit(1)
}, TIMEOUT_MS)

gradle.on('close', (code) => {
  clearTimeout(timer)

  if (code !== 0) {
    // Req 6.4 — diagnose missing ANDROID_HOME or JAVA_HOME
    if (stderrOutput.includes('ANDROID_HOME') || stderrOutput.includes('SDK location')) {
      console.error('Error: Android SDK not found. Set the ANDROID_HOME environment variable to the Android SDK path (API level 34 required).')
    } else if (stderrOutput.includes('JAVA_HOME') || stderrOutput.includes('No JDK')) {
      console.error('Error: JDK not found. Set the JAVA_HOME environment variable to a JDK 17 installation.')
    } else {
      console.error(`Gradle build failed with exit code ${code}`)
    }
    process.exit(code || 1)
  }

  // Req 6.3 — report APK path and size on success
  if (fs.existsSync(APK_PATH)) {
    const stats = fs.statSync(APK_PATH)
    console.log(`APK built successfully: ${APK_PATH} (${stats.size} bytes)`)
  } else {
    console.warn(`Gradle succeeded but APK not found at expected path: ${APK_PATH}`)
  }
})

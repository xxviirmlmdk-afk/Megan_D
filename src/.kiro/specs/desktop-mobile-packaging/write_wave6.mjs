// write_wave6.mjs — Wave 6 files: 10.2, 10.3, 11.1, 11.2
import { writeFileSync, mkdirSync, readFileSync } from 'fs'
import { join, dirname } from 'path'

const ROOT = 'C:\\Users\\29146640\\AppData\\Local\\Programs\\Megan_D'

function write(relPath, content) {
  const full = join(ROOT, relPath)
  mkdirSync(dirname(full), { recursive: true })
  writeFileSync(full, content, { encoding: 'utf-8' })
  console.log(`  wrote: ${relPath}`)
}

// ─── Task 10.2: tests/smoke/desktop.spec.ts ──────────────────────────────────
write('tests/smoke/desktop.spec.ts', `// tests/smoke/desktop.spec.ts — Desktop smoke test
// Feature: desktop-mobile-packaging, Property 8 & 9
// Requirements: 7.1, 7.2, 7.5
//
// Requires: @playwright/test with Electron support
// Run with: npm run test:smoke:desktop

import { test, expect } from '@playwright/test'
import { _electron as electron } from 'playwright'
import * as path from 'path'
import { reportFailure } from './reporter'

const ARTIFACT_PATH = path.resolve('release')

test('desktop smoke — window opens and login screen renders', async () => {
  let electronApp: Awaited<ReturnType<typeof electron.launch>> | null = null

  try {
    // Launch the Electron app
    electronApp = await electron.launch({ args: ['.'] })

    // Property 8: Electron window appears within 10 seconds
    // Validates: Requirements 7.1
    let page: Awaited<ReturnType<typeof electronApp.firstWindow>>
    try {
      page = await electronApp.firstWindow()
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 })
      const isVisible = await page.evaluate(() => !document.hidden)
      expect(isVisible, 'Window should be visible and non-minimised').toBe(true)
    } catch (err) {
      reportFailure(
        \`Window did not open within 10 seconds: \${err}\`,
        'desktop',
        path.resolve(ARTIFACT_PATH)
      )
      throw err
    }

    // Property 9: Login screen present with no console errors
    // Validates: Requirements 7.2
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        consoleErrors.push(\`[\${msg.type()}] \${msg.text()}\`)
      }
    })

    try {
      // Assert username input is present
      await expect(page.locator('input[type="text"], input[name="username"], input[placeholder*="user" i]').first()).toBeVisible({ timeout: 5000 })
    } catch (err) {
      reportFailure('Username input not found in login screen', 'desktop', path.resolve(ARTIFACT_PATH))
      throw err
    }

    try {
      // Assert password input is present
      await expect(page.locator('input[type="password"]').first()).toBeVisible({ timeout: 5000 })
    } catch (err) {
      reportFailure('Password input not found in login screen', 'desktop', path.resolve(ARTIFACT_PATH))
      throw err
    }

    try {
      // Assert sign-in button is present
      await expect(page.locator('button:has-text("Sign"), button:has-text("Login"), button:has-text("Log in")').first()).toBeVisible({ timeout: 5000 })
    } catch (err) {
      reportFailure('Sign-in button not found in login screen', 'desktop', path.resolve(ARTIFACT_PATH))
      throw err
    }

    // Assert zero JS console errors during load
    try {
      expect(consoleErrors, \`Console errors detected: \${consoleErrors.join('; ')}\`).toHaveLength(0)
    } catch (err) {
      reportFailure(\`JavaScript console errors detected: \${consoleErrors.join('; ')}\`, 'desktop', path.resolve(ARTIFACT_PATH))
      throw err
    }

  } finally {
    if (electronApp) {
      await electronApp.close()
    }
  }
})
`)

// ─── Task 10.3: add test:smoke:desktop npm script ────────────────────────────
const pkgPath = join(ROOT, 'package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))

pkg.scripts['test:smoke:desktop'] = 'playwright test tests/smoke/desktop.spec.ts'

// Also add playwright as devDependency if not present
if (!pkg.devDependencies['@playwright/test']) {
  pkg.devDependencies['@playwright/test'] = '1.44.1'
  pkg.devDependencies['playwright'] = '1.44.1'
}

writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', { encoding: 'utf-8' })
console.log('  updated: package.json (test:smoke:desktop script + playwright dep)')

// ─── Task 11.1: tests/smoke/android.spec.ts ──────────────────────────────────
write('tests/smoke/android.spec.ts', `// tests/smoke/android.spec.ts — Android smoke test
// Feature: desktop-mobile-packaging, Property 10 & 11
// Requirements: 7.3, 7.4, 7.5
//
// Requires: @wdio/cli and appium
// Run with: npm run test:smoke:android

import { remote } from 'webdriverio'
import * as path from 'path'
import { reportFailure } from './reporter'

const APK_PATH = path.resolve(\`release/MeganD-\${require('../../package.json').version}-debug.apk\`)
const ACTIVITY_TIMEOUT_MS = 15000

async function runAndroidSmokeTest() {
  let driver: Awaited<ReturnType<typeof remote>> | null = null

  try {
    driver = await remote({
      capabilities: {
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        'appium:app': APK_PATH,
        'appium:newCommandTimeout': 30,
      },
      hostname: 'localhost',
      port: 4723,
      logLevel: 'error',
    })

    // Property 10: Activity reaches foreground within 15 seconds, no crash/ANR
    // Validates: Requirements 7.3
    let activityReached = false
    try {
      await driver.waitUntil(
        async () => {
          const activity = await driver!.getCurrentActivity()
          return activity !== null && !activity.includes('crash') && !activity.includes('anr')
        },
        { timeout: ACTIVITY_TIMEOUT_MS, timeoutMsg: 'Main activity did not reach foreground within 15 seconds' }
      )
      activityReached = true
    } catch (err) {
      reportFailure(
        \`Main activity did not reach foreground within 15 seconds: \${err}\`,
        'mobile',
        APK_PATH
      )
      throw err
    }

    // Property 11: WebView renders content (not blank)
    // Validates: Requirements 7.4
    if (activityReached) {
      try {
        // Switch to WebView context
        const contexts = await driver.getContexts()
        const webviewContext = contexts.find((c: string) => c.startsWith('WEBVIEW'))
        if (webviewContext) {
          await driver.switchContext(webviewContext)
          const bodyChildren = await driver.$$('body > *')
          expect(bodyChildren.length, 'WebView should have rendered child elements').toBeGreaterThan(0)
        }
      } catch (err) {
        reportFailure(
          \`WebView does not contain rendered child elements (possible blank screen): \${err}\`,
          'mobile',
          APK_PATH
        )
        throw err
      }
    }

  } finally {
    if (driver) {
      await driver.deleteSession()
    }
  }
}

// Export for wdio runner
module.exports = { runAndroidSmokeTest }
`)

// ─── Task 11.2: add test:smoke:android npm script + wdio deps ────────────────
const pkg2 = JSON.parse(readFileSync(pkgPath, 'utf-8'))

pkg2.scripts['test:smoke:android'] = 'npx wdio tests/smoke/android.spec.ts'

if (!pkg2.devDependencies['@wdio/cli']) {
  pkg2.devDependencies['@wdio/cli'] = '8.39.0'
  pkg2.devDependencies['appium'] = '2.11.2'
  pkg2.devDependencies['webdriverio'] = '8.39.0'
}

writeFileSync(pkgPath, JSON.stringify(pkg2, null, 2) + '\n', { encoding: 'utf-8' })
console.log('  updated: package.json (test:smoke:android script + wdio/appium deps)')

console.log('Wave 6 files written successfully.')

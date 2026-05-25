// tests/smoke/android.spec.ts — Android smoke test
// Feature: desktop-mobile-packaging, Property 10 & 11
// Requirements: 7.3, 7.4, 7.5
//
// Requires: @wdio/cli and appium
// Run with: npm run test:smoke:android

import { remote } from 'webdriverio'
import * as path from 'path'
import { reportFailure } from './reporter'

const APK_PATH = path.resolve(`release/MeganD-${require('../../package.json').version}-debug.apk`)
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
        `Main activity did not reach foreground within 15 seconds: ${err}`,
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
          `WebView does not contain rendered child elements (possible blank screen): ${err}`,
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

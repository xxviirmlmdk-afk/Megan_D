// tests/smoke/desktop.spec.ts — Desktop smoke test
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
        `Window did not open within 10 seconds: ${err}`,
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
        consoleErrors.push(`[${msg.type()}] ${msg.text()}`)
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
      expect(consoleErrors, `Console errors detected: ${consoleErrors.join('; ')}`).toHaveLength(0)
    } catch (err) {
      reportFailure(`JavaScript console errors detected: ${consoleErrors.join('; ')}`, 'desktop', path.resolve(ARTIFACT_PATH))
      throw err
    }

  } finally {
    if (electronApp) {
      await electronApp.close()
    }
  }
})

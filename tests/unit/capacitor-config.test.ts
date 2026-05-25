import { describe, it, expect } from 'vitest'
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

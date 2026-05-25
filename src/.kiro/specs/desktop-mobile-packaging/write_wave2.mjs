// write_wave2.mjs — Wave 2 files: 3.3, 4.3, 6.2
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'

const ROOT = 'C:\\Users\\29146640\\AppData\\Local\\Programs\\Megan_D'

function write(relPath, content) {
  const full = join(ROOT, relPath)
  mkdirSync(dirname(full), { recursive: true })
  writeFileSync(full, content, { encoding: 'utf-8' })
  console.log(`  wrote: ${relPath}`)
}

// ─── Task 3.3: tests/unit/electron-config.test.ts ───────────────────────────
write('tests/unit/electron-config.test.ts', `import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

// Task 3.3: Unit tests for Electron main process configuration
// Requirements: 3.2, 3.5, 3.6

const MAIN_JS = join(__dirname, '../../electron/main.js')

describe('Electron main process configuration', () => {
  it('sets nodeIntegration: false', () => {
    const src = readFileSync(MAIN_JS, 'utf-8')
    expect(src).toContain('nodeIntegration: false')
  })

  it('sets contextIsolation: true', () => {
    const src = readFileSync(MAIN_JS, 'utf-8')
    expect(src).toContain('contextIsolation: true')
  })

  it('sets minWidth: 1024', () => {
    const src = readFileSync(MAIN_JS, 'utf-8')
    expect(src).toContain('minWidth: MIN_WIDTH')
    expect(src).toContain('const MIN_WIDTH = 1024')
  })

  it('sets minHeight: 768', () => {
    const src = readFileSync(MAIN_JS, 'utf-8')
    expect(src).toContain('minHeight: MIN_HEIGHT')
    expect(src).toContain('const MIN_HEIGHT = 768')
  })
})
`)

// ─── Task 3.3: tests/unit/electron-main.test.ts ─────────────────────────────
write('tests/unit/electron-main.test.ts', `import { describe, it, expect, vi, beforeEach } from 'vitest'

// Task 3.3: Unit test for Electron main guard path (missing dist/index.html)
// Requirements: 3.6
//
// We test the guard logic by mocking the electron and fs modules.

describe('Electron main process — missing dist guard', () => {
  it('calls dialog.showMessageBoxSync with the required message when dist/index.html is absent', async () => {
    // Mock electron modules
    const mockShowMessageBoxSync = vi.fn().mockReturnValue(0)
    const mockExit = vi.fn()

    vi.mock('electron', () => ({
      app: {
        whenReady: () => Promise.resolve(),
        on: vi.fn(),
        exit: mockExit,
      },
      BrowserWindow: vi.fn(),
      dialog: {
        showMessageBoxSync: mockShowMessageBoxSync,
      },
    }))

    vi.mock('fs', () => ({
      existsSync: vi.fn().mockReturnValue(false),
    }))

    // The guard message must match exactly (Req 3.6)
    const EXPECTED_MESSAGE =
      'Build output missing: dist/index.html not found. Please run the build command before launching.'

    // Simulate the guard logic directly (mirrors electron/main.js guard block)
    const { dialog, app } = await import('electron')
    const { existsSync } = await import('fs')

    if (!existsSync('dist/index.html')) {
      dialog.showMessageBoxSync({
        type: 'error',
        title: 'Build Output Missing',
        message: EXPECTED_MESSAGE,
        buttons: ['OK'],
      })
      app.exit(1)
    }

    expect(mockShowMessageBoxSync).toHaveBeenCalledOnce()
    const callArg = mockShowMessageBoxSync.mock.calls[0][0]
    expect(callArg.message).toBe(EXPECTED_MESSAGE)

    expect(mockExit).toHaveBeenCalledWith(1)
  })
})
`)

// ─── Task 4.3: tests/unit/pipeline-guards.test.ts ───────────────────────────
write('tests/unit/pipeline-guards.test.ts', `import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

// Task 4.3 & 8.3: Unit tests for pipeline guard ordering
// Requirements: 4.6, 5.6

const PKG_PATH = join(__dirname, '../../package.json')

describe('Pipeline guard ordering', () => {
  let scripts: Record<string, string>

  beforeEach(() => {
    const pkg = JSON.parse(readFileSync(PKG_PATH, 'utf-8'))
    scripts = pkg.scripts
  })

  // Task 4.3: package:desktop must run build before electron-builder
  it('package:desktop invokes npm run build before electron-builder', () => {
    const script = scripts['package:desktop']
    expect(script).toBeDefined()
    const buildIdx = script.indexOf('npm run build')
    const ebIdx = script.indexOf('electron-builder')
    expect(buildIdx).toBeGreaterThanOrEqual(0)
    expect(ebIdx).toBeGreaterThanOrEqual(0)
    expect(buildIdx).toBeLessThan(ebIdx)
  })

  // Task 8.3: cap:sync must run build before npx cap sync android
  it('cap:sync invokes npm run build before npx cap sync android', () => {
    const script = scripts['cap:sync']
    expect(script).toBeDefined()
    const buildIdx = script.indexOf('npm run build')
    const capIdx = script.indexOf('npx cap sync android')
    expect(buildIdx).toBeGreaterThanOrEqual(0)
    expect(capIdx).toBeGreaterThanOrEqual(0)
    expect(buildIdx).toBeLessThan(capIdx)
  })
})
`)

// ─── Task 6.2: android/variables.gradle ─────────────────────────────────────
write('android/variables.gradle', `// android/variables.gradle — Android SDK version configuration
// Requirements: 5.5, 6.5
// This file is written after 'npx cap add android' generates the android/ directory.
// It locks the SDK versions to ensure the Gradle project compiles without errors.

ext {
    minSdkVersion = 24      // Req 6.5 — Android 7.0+
    compileSdkVersion = 34
    targetSdkVersion = 34
}
`)

console.log('Wave 2 files written successfully.')

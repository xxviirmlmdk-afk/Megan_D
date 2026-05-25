// write_wave789.mjs — Wave 7, 8, 9 files: 11.3, 12.1, 12.2
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'

const ROOT = 'C:\\Users\\29146640\\AppData\\Local\\Programs\\Megan_D'

function write(relPath, content) {
  const full = join(ROOT, relPath)
  mkdirSync(dirname(full), { recursive: true })
  writeFileSync(full, content, { encoding: 'utf-8' })
  console.log(`  wrote: ${relPath}`)
}

// ─── Task 11.3: tests/unit/smoke-reporter.test.ts ────────────────────────────
write('tests/unit/smoke-reporter.test.ts', `import { describe, it, expect, vi, afterEach } from 'vitest'
import * as fc from 'fast-check'

// Feature: desktop-mobile-packaging, Property 12: Smoke test error output
// Validates: Requirements 7.5

// We test the reportFailure function by spying on process.stderr.write
describe('Property 12: Smoke test failure output contains required diagnostic fields', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('stderr output contains assertion text, platform, and artifact path', async () => {
    // Dynamically import to allow vi.mock to work
    const { reportFailure } = await import('../smoke/reporter')

    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }),   // assertion text
        fc.constantFrom('desktop', 'mobile') as fc.Arbitrary<'desktop' | 'mobile'>,
        fc.string({ minLength: 1, maxLength: 200 }),   // artifact path
        (assertion, platform, artifactPath) => {
          const stderrChunks: string[] = []
          const spy = vi.spyOn(process.stderr, 'write').mockImplementation((chunk: unknown) => {
            stderrChunks.push(String(chunk))
            return true
          })

          reportFailure(assertion, platform, artifactPath)

          const output = stderrChunks.join('')

          spy.mockRestore()

          return (
            output.includes(assertion) &&
            output.includes(platform) &&
            output.includes(artifactPath)
          )
        }
      ),
      { numRuns: 100 }
    )
  })
})
`)

// ─── Task 12.1: .github/workflows/release.yml ────────────────────────────────
write('.github/workflows/release.yml', `# .github/workflows/release.yml
# GitHub Actions release workflow
# Requirements: 9.1–9.10
#
# Triggers ONLY on semver version tags (v*.*.*).
# Branch pushes, PR events, and non-version tags do NOT trigger this workflow.

name: Release

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  build-desktop:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'

      - run: npm ci

      - run: npm run package:desktop
        # produces release/MeganD-{version}-setup.exe

      - uses: actions/upload-artifact@v4
        with:
          name: desktop-installer
          path: release/MeganD-*-setup.exe

  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'

      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '17'

      - run: npm ci

      - run: npm run cap:sync
        # runs vite build then npx cap sync android

      - run: node scripts/build-android.js
        # invokes ./gradlew assembleDebug inside android/ with 300s timeout

      - run: node scripts/collect-artifacts.js
        # copies app-debug.apk -> release/MeganD-{version}-debug.apk

      - uses: actions/upload-artifact@v4
        with:
          name: android-apk
          path: release/MeganD-*-debug.apk

  publish-release:
    runs-on: ubuntu-latest
    needs: [build-desktop, build-android]
    steps:
      - uses: actions/checkout@v4

      - uses: actions/download-artifact@v4
        with:
          name: desktop-installer
          path: release/

      - uses: actions/download-artifact@v4
        with:
          name: android-apk
          path: release/

      - run: node scripts/manifest.js
        # generates release/manifest.json and prints it to stdout

      - uses: softprops/action-gh-release@v2
        with:
          tag_name: \${{ github.ref_name }}
          name: Megan_D \${{ github.ref_name }}
          body_path: release/manifest.json
          files: |
            release/MeganD-*-setup.exe
            release/MeganD-*-debug.apk
            release/manifest.json
          token: \${{ secrets.GITHUB_TOKEN }}
`)

// ─── Task 12.2: tests/unit/workflow-config.test.ts ───────────────────────────
write('tests/unit/workflow-config.test.ts', `import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

// Feature: desktop-mobile-packaging, Property 13: CI workflow only triggers on version tags
// Validates: Requirements 9.2

const WORKFLOW_PATH = join(__dirname, '../../.github/workflows/release.yml')

describe('Property 13: CI workflow only triggers on version tags', () => {
  let workflowSrc: string

  beforeEach(() => {
    workflowSrc = readFileSync(WORKFLOW_PATH, 'utf-8')
  })

  it('on.push.tags contains v*.*.* pattern', () => {
    // The workflow must trigger on version tags
    expect(workflowSrc).toContain("- 'v*.*.*'")
  })

  it('does not trigger on branch pushes (no on.push.branches)', () => {
    // Must not have a branches key under push
    expect(workflowSrc).not.toMatch(/push:\\s*\\n(\\s+.*\\n)*\\s+branches:/)
  })

  it('does not trigger on pull_request events', () => {
    // Must not have a pull_request trigger
    expect(workflowSrc).not.toMatch(/^\\s*pull_request:/m)
  })
})
`)

console.log('Wave 7/8/9 files written successfully.')

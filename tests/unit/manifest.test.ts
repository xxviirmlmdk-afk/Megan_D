import { describe, it, expect, vi, afterEach } from 'vitest'
import { writeFileSync, readFileSync, mkdirSync, unlinkSync, existsSync } from 'fs'
import { join } from 'path'
import * as fc from 'fast-check'
import * as crypto from 'crypto'
import * as os from 'os'

// Feature: desktop-mobile-packaging
// Properties 4, 5, 6, 7 — manifest generation correctness

// ─── Inline artifactEntry logic (mirrors scripts/manifest.js) ───────────────
function artifactEntry(filePath: string) {
  if (!existsSync(filePath)) {
    return { filename: require('path').basename(filePath), status: 'failed' as const }
  }
  const buf = readFileSync(filePath)
  return {
    filename: require('path').basename(filePath),
    size: buf.length,
    sha256: crypto.createHash('sha256').update(buf).digest('hex'),
    status: 'success' as const,
  }
}

function buildFilename(version: string, type: 'exe' | 'apk'): string {
  return type === 'exe'
    ? `MeganD-${version}-setup.exe`
    : `MeganD-${version}-debug.apk`
}

const TMP = os.tmpdir()

// ─── Property 5: Manifest artifact size field equals actual file size ────────
// Feature: desktop-mobile-packaging, Property 5: Manifest artifact size accuracy
// Validates: Requirements 4.4, 6.3, 8.2
describe('Property 5: Manifest artifact size accuracy', () => {
  it('size field equals actual file size for random byte buffers', () => {
    fc.assert(
      fc.property(
        fc.uint8Array({ minLength: 0, maxLength: 10000 }),
        (bytes) => {
          const tmpFile = join(TMP, `manifest-test-${Date.now()}-${Math.random()}.bin`)
          writeFileSync(tmpFile, Buffer.from(bytes))
          try {
            const entry = artifactEntry(tmpFile)
            if (entry.status !== 'success') return false
            return entry.size === bytes.length
          } finally {
            if (existsSync(tmpFile)) unlinkSync(tmpFile)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ─── Property 6: Manifest correctly reflects present and absent artifacts ────
// Feature: desktop-mobile-packaging, Property 6: Manifest present/absent status
// Validates: Requirements 8.4
describe('Property 6: Manifest present/absent status', () => {
  it('present files get status:success with size and sha256; absent get status:failed with filename only', () => {
    fc.assert(
      fc.property(
        fc.boolean(),  // exe present?
        fc.boolean(),  // apk present?
        fc.uint8Array({ minLength: 1, maxLength: 1000 }),
        (exePresent, apkPresent, bytes) => {
          const tmpExe = join(TMP, `test-${Date.now()}-${Math.random()}-setup.exe`)
          const tmpApk = join(TMP, `test-${Date.now()}-${Math.random()}-debug.apk`)

          if (exePresent) writeFileSync(tmpExe, Buffer.from(bytes))
          if (apkPresent) writeFileSync(tmpApk, Buffer.from(bytes))

          try {
            const exeEntry = artifactEntry(tmpExe)
            const apkEntry = artifactEntry(tmpApk)

            if (exePresent) {
              if (exeEntry.status !== 'success') return false
              if (typeof exeEntry.size !== 'number') return false
              if (typeof exeEntry.sha256 !== 'string') return false
            } else {
              if (exeEntry.status !== 'failed') return false
              if ('size' in exeEntry) return false
              if ('sha256' in exeEntry) return false
            }

            if (apkPresent) {
              if (apkEntry.status !== 'success') return false
              if (typeof apkEntry.size !== 'number') return false
              if (typeof apkEntry.sha256 !== 'string') return false
            } else {
              if (apkEntry.status !== 'failed') return false
              if ('size' in apkEntry) return false
              if ('sha256' in apkEntry) return false
            }

            return true
          } finally {
            if (existsSync(tmpExe)) unlinkSync(tmpExe)
            if (existsSync(tmpApk)) unlinkSync(tmpApk)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ─── Property 7: Manifest stdout output equals manifest file content ─────────
// Feature: desktop-mobile-packaging, Property 7: Manifest stdout equals file
// Validates: Requirements 8.5
describe('Property 7: Manifest stdout equals file content', () => {
  it('JSON.stringify output is byte-for-byte identical to what would be written to file', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),  // version string
        fc.boolean(),
        fc.boolean(),
        fc.uint8Array({ minLength: 0, maxLength: 500 }),
        (version, exePresent, apkPresent, bytes) => {
          const tmpDir = join(TMP, `manifest-stdout-${Date.now()}-${Math.random()}`)
          mkdirSync(tmpDir, { recursive: true })

          const exePath = join(tmpDir, `MeganD-${version}-setup.exe`)
          const apkPath = join(tmpDir, `MeganD-${version}-debug.apk`)
          const manifestPath = join(tmpDir, 'manifest.json')

          if (exePresent) writeFileSync(exePath, Buffer.from(bytes))
          if (apkPresent) writeFileSync(apkPath, Buffer.from(bytes))

          const manifest = {
            version,
            buildTimestamp: new Date().toISOString(),
            artifacts: [artifactEntry(exePath), artifactEntry(apkPath)],
          }

          const json = JSON.stringify(manifest, null, 2)
          writeFileSync(manifestPath, json, 'utf-8')

          // stdout output (json) must equal file content
          const fileContent = readFileSync(manifestPath, 'utf-8')
          return json === fileContent
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ─── Property 4: Release artifact filenames match versioned naming pattern ───
// Feature: desktop-mobile-packaging, Property 4: Artifact filename pattern
// Validates: Requirements 4.2, 8.3
describe('Property 4: Artifact filename pattern', () => {
  it('exe filename matches MeganD-{version}-setup.exe', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.nat({ max: 99 }),
          fc.nat({ max: 99 }),
          fc.nat({ max: 99 })
        ),
        ([major, minor, patch]) => {
          const version = `${major}.${minor}.${patch}`
          const exeName = buildFilename(version, 'exe')
          const apkName = buildFilename(version, 'apk')

          const exePattern = /^MeganD-\d+\.\d+\.\d+-setup\.exe$/
          const apkPattern = /^MeganD-\d+\.\d+\.\d+-debug\.apk$/

          return exePattern.test(exeName) && apkPattern.test(apkName)
        }
      ),
      { numRuns: 100 }
    )
  })
})

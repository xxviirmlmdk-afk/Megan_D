// write_wave5.mjs — Wave 5 files: 8.2, 8.3, 10.1
import { writeFileSync, mkdirSync, readFileSync } from 'fs'
import { join, dirname } from 'path'

const ROOT = 'C:\\Users\\29146640\\AppData\\Local\\Programs\\Megan_D'

function write(relPath, content) {
  const full = join(ROOT, relPath)
  mkdirSync(dirname(full), { recursive: true })
  writeFileSync(full, content, { encoding: 'utf-8' })
  console.log(`  wrote: ${relPath}`)
}

// ─── Task 8.2: Add release npm script to package.json ───────────────────────
const pkgPath = join(ROOT, 'package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))

pkg.scripts['release'] = 'npm run package:desktop && npm run cap:sync && node scripts/build-android.js && node scripts/collect-artifacts.js && node scripts/manifest.js'

writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', { encoding: 'utf-8' })
console.log('  updated: package.json (release script)')

// ─── Task 8.3: pipeline-guards.test.ts already written in Wave 2 ────────────
// (cap:sync guard test is already in tests/unit/pipeline-guards.test.ts)
console.log('  (pipeline-guards.test.ts already contains cap:sync guard test from Wave 2)')

// ─── Task 10.1: tests/smoke/reporter.ts ─────────────────────────────────────
write('tests/smoke/reporter.ts', `// tests/smoke/reporter.ts — Shared diagnostic reporter for smoke tests
// Requirements: 7.5
//
// Exports reportFailure() used by both desktop and android smoke tests.
// On failure, writes the assertion text, platform identifier, and artifact path to stderr.

/**
 * Report a smoke test failure to stderr.
 * @param assertion  The failed assertion text
 * @param platform   'desktop' or 'mobile'
 * @param artifactPath  Absolute path to the artifact under test
 */
export function reportFailure(
  assertion: string,
  platform: 'desktop' | 'mobile',
  artifactPath: string
): void {
  process.stderr.write(
    \`[SMOKE FAILURE] platform=\${platform} artifact=\${artifactPath} assertion=\${assertion}\\n\`
  )
}
`)

console.log('Wave 5 files written successfully.')

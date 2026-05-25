import { describe, it, expect } from 'vitest'
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

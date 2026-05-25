import { describe, it, expect } from 'vitest'
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

import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const DIST_DIR = join(__dirname, '../../dist')
const INDEX_HTML = join(DIST_DIR, 'index.html')

// Property 1: Vite build emits only relative asset paths
// Validates: Requirements 1.5
describe('Vite build output', () => {
  it('Property 1: dist/index.html references only relative asset paths', () => {
    const html = readFileSync(INDEX_HTML, 'utf-8')
    const srcMatches = Array.from(html.matchAll(/\bsrc=["']([^"']+)["']/g)).map((m) => m[1])
    const hrefMatches = Array.from(html.matchAll(/\bhref=["']([^"']+)["']/g)).map((m) => m[1])
    const allPaths = [...srcMatches, ...hrefMatches]

    const bundledAssets = allPaths.filter(
      (p) => p.includes('assets/') || p.endsWith('.js') || p.endsWith('.css')
    )

    for (const assetPath of bundledAssets) {
      expect(
        assetPath.startsWith('./') || (!assetPath.startsWith('/') && !assetPath.startsWith('http')),
        `Asset path should be relative, got: ${assetPath}`
      ).toBe(true)
      expect(assetPath.startsWith('/'), `Asset path must not start with /, got: ${assetPath}`).toBe(false)
    }
  })

  // Property 2: Vite build emits no source map files
  // Validates: Requirements 1.6
  it('Property 2: dist/ contains no .map files', () => {
    function listFiles(dir) {
      const entries = readdirSync(dir, { withFileTypes: true })
      const files = []
      for (const entry of entries) {
        const full = join(dir, entry.name)
        if (entry.isDirectory()) {
          files.push(...listFiles(full))
        } else {
          files.push(full)
        }
      }
      return files
    }

    const allFiles = listFiles(DIST_DIR)
    const mapFiles = allFiles.filter((f) => f.endsWith('.map'))
    expect(mapFiles, `Found .map files in dist/: ${mapFiles.join(', ')}`).toHaveLength(0)
  })
})

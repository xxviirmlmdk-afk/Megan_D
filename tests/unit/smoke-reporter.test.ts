import { describe, it, expect, vi, afterEach } from 'vitest'
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

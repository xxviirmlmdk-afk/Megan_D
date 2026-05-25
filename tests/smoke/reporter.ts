// tests/smoke/reporter.ts — Shared diagnostic reporter for smoke tests
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
    `[SMOKE FAILURE] platform=${platform} artifact=${artifactPath} assertion=${assertion}\n`
  )
}

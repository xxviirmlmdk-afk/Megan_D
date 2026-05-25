import { describe, it, expect } from 'vitest'
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
    expect(workflowSrc).not.toMatch(/push:\s*\n(\s+.*\n)*\s+branches:/)
  })

  it('does not trigger on pull_request events', () => {
    // Must not have a pull_request trigger
    expect(workflowSrc).not.toMatch(/^\s*pull_request:/m)
  })
})

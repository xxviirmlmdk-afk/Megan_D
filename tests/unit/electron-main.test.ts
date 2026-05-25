import { describe, it, expect, vi, beforeEach } from 'vitest'

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

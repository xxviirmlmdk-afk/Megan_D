# Implementation Plan: desktop-mobile-packaging

## Overview

Package the Megan_D Security Operations Platform for distribution as a Windows `.exe` installer (Electron + electron-builder) and an Android `.apk` (Capacitor + Gradle). The Vite production build (`dist/`) is the shared web asset embedded by both wrappers. All new files live outside `src/` — the existing React/TypeScript source is never modified.

---

## Tasks

- [ ] 1. Adjust Vite configuration for cross-platform compatibility
  - [-] 1.1 Set `base: './'` and `sourcemap: false` in `vite.config.ts`
    - Open `vite.config.ts` at the project root (parent of `src/`)
    - Add `base: './'` to the `defineConfig` call so Vite emits relative asset paths (required for Electron `file://` loading and Capacitor WebView)
    - Add `build: { sourcemap: false, outDir: 'dist' }` to prevent `.map` files in `dist/`
    - Leave all existing plugins (React, etc.) and other config keys untouched
    - _Requirements: 1.5, 1.6_

  - [-] 1.2 Write property test — relative asset paths (Property 1)
    - **Property 1: Vite build emits only relative asset paths**
    - In `tests/unit/build-output.test.ts`, after running `vite build`, parse `dist/index.html` and assert every `src` and `href` attribute referencing a bundled asset begins with `./` or a bare filename and does NOT begin with `/`
    - Run once post-build (example-based Vitest test, not fast-check)
    - **Validates: Requirements 1.5**

  - [-] 1.3 Write property test — no source map files (Property 2)
    - **Property 2: Vite build emits no source map files**
    - In `tests/unit/build-output.test.ts`, after running `vite build`, recursively list `dist/` and assert zero files have a `.map` extension
    - Run once post-build (example-based Vitest test)
    - **Validates: Requirements 1.6**

- [ ] 2. Install and configure packaging dependencies
  - [-] 2.1 Add Electron and electron-builder as devDependencies
    - In `package.json`, add `electron` and `electron-builder` to `devDependencies` with pinned versions
    - Ensure no entry in the `dependencies` section is added, removed, or modified
    - _Requirements: 2.3_

  - [-] 2.2 Add Capacitor CLI and Android platform as devDependencies
    - In `package.json`, add `@capacitor/cli`, `@capacitor/core`, and `@capacitor/android` to `devDependencies` with pinned versions
    - Ensure no entry in the `dependencies` section is added, removed, or modified
    - _Requirements: 2.3_

  - [-] 2.3 Add fast-check and Vitest as devDependencies
    - In `package.json`, add `fast-check` and `vitest` to `devDependencies` with pinned versions
    - _Requirements: 2.1, 2.4_

  - [-] 2.4 Create `vitest.config.ts` at the project root
    - Create `vitest.config.ts` configuring `test.include: ["tests/unit/**/*.test.ts"]` and `test.exclude: ["tests/smoke/**"]`
    - This ensures smoke tests (which require a full Electron/Android environment) are excluded from the standard unit test run
    - _Requirements: 2.1_

  - [x] 2.5 Update `.gitignore` at the project root
    - Ensure the following entries are present in `.gitignore` (create the file if it does not exist at the project root):
      - `dist/`
      - `release/`
      - `android/`
      - `node_modules/`
    - _Requirements: 1.2, 8.1_

- [ ] 3. Implement the Electron desktop wrapper
  - [-] 3.1 Create `electron/main.js` — main process entry point
    - Create `electron/main.js` as a CommonJS module (no TypeScript transpilation step)
    - Implement `createWindow()`: create a `BrowserWindow` with `width: 1280`, `height: 800`, `minWidth: 1024`, `minHeight: 768`
    - Set `webPreferences: { nodeIntegration: false, contextIsolation: true, preload: path.join(__dirname, 'preload.js') }`
    - Guard: if `dist/index.html` does not exist, show a modal error dialog with the exact message `"Build output missing: dist/index.html not found. Please run the build command before launching."` then exit with a non-zero code after dismissal
    - Call `win.loadFile(DIST_INDEX)` to load the app
    - Handle `app.on('window-all-closed', () => app.quit())` for clean exit on all platforms
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 3.6_

  - [-] 3.2 Create `electron/preload.js` — context bridge stub
    - Create `electron/preload.js` as a CommonJS module
    - Use `contextBridge.exposeInMainWorld('electronAPI', {})` — expose no APIs to the renderer
    - Add a comment explaining the stub is intentional and provides a safe extension point for future IPC
    - _Requirements: 3.5_

  - [~] 3.3 Write unit tests for Electron main process configuration
    - In `tests/unit/electron-config.test.ts`, parse `electron/main.js` as text and assert:
      - `nodeIntegration: false` is present
      - `contextIsolation: true` is present
      - `minWidth: 1024` and `minHeight: 768` are present
    - In `tests/unit/electron-main.test.ts`, mock `fs.existsSync` to return `false` and assert the guard path calls `dialog.showMessageBoxSync` with the required message text before calling `app.exit` with a non-zero code
    - _Requirements: 3.2, 3.5, 3.6_

- [ ] 4. Configure electron-builder for Windows NSIS packaging
  - [-] 4.1 Add electron-builder `"build"` config to `package.json`
    - Add a top-level `"build"` key to `package.json` with:
      - `appId: "com.megand.secops"`, `productName: "Megan_D"`, `copyright: "Copyright © 2024"`
      - `directories.output: "release"`
      - `files: ["dist/**/*", "electron/**/*", "package.json"]`
      - `win.target: "nsis"`, `win.artifactName: "MeganD-${version}-setup.exe"`
      - `nsis: { oneClick: false, allowToChangeInstallationDirectory: true }`
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

  - [~] 4.2 Add `package:desktop` and `electron:dev` npm scripts
    - In `package.json` `"scripts"`, add:
      - `"electron:dev": "npm run build && electron ."`
      - `"package:desktop": "npm run build && electron-builder --win"`
    - The `build` prefix ensures `dist/` is always fresh before packaging (guards Req 4.6)
    - _Requirements: 4.1, 4.6_

  - [~] 4.3 Write unit test — pipeline guard ordering for desktop packaging
    - In `tests/unit/pipeline-guards.test.ts`, assert that the `package:desktop` script definition in `package.json` invokes `npm run build` before `electron-builder`, confirming the guard ordering
    - _Requirements: 4.6_

- [~] 5. Checkpoint — Electron layer complete
  - Run `npx vitest --run` and confirm all unit tests pass
  - Verify `electron/main.js`, `electron/preload.js`, and the `"build"` config in `package.json` are present and correct
  - Ask the user if any questions arise before proceeding to the Capacitor layer

- [ ] 6. Implement the Capacitor Android wrapper
  - [-] 6.1 Create `capacitor.config.ts` at the project root
    - Create `capacitor.config.ts` importing `CapacitorConfig` from `@capacitor/cli`
    - Set `appId: 'com.megand.secops'`, `appName: 'Megan_D'`, `webDir: 'dist'`
    - Set `server.androidScheme: 'https'` to prevent mixed-content issues in the WebView
    - Set `android.minSdkVersion: 24`
    - _Requirements: 5.1, 5.4, 6.5_

  - [~] 6.2 Create `android/variables.gradle` with correct SDK versions
    - After `npx cap add android` generates the `android/` directory, create or update `android/variables.gradle` to ensure:
      - `minSdkVersion = 24` (Req 6.5 — Android 7.0+)
      - `compileSdkVersion = 34`
      - `targetSdkVersion = 34`
    - Write the file with these exact values so the Gradle project compiles without errors
    - _Requirements: 5.5, 6.5_

  - [~] 6.3 Add Capacitor npm scripts
    - In `package.json` `"scripts"`, add:
      - `"cap:sync": "npm run build && npx cap sync android"`
      - `"build:android": "npm run cap:sync && cd android && ./gradlew assembleDebug"`
    - The `build` prefix in `cap:sync` ensures `dist/` is always fresh before syncing (guards Req 5.6)
    - _Requirements: 5.2, 5.3, 5.6, 6.1_

  - [~] 6.4 Write unit tests for Capacitor and Android configuration
    - In `tests/unit/capacitor-config.test.ts`, import `capacitor.config.ts` and assert `appId === 'com.megand.secops'`, `appName === 'Megan_D'`, `webDir === 'dist'`, `server.androidScheme === 'https'`
    - In `tests/unit/android-config.test.ts`, read `android/variables.gradle` as text and assert `minSdkVersion = 24` is present
    - _Requirements: 5.1, 5.4, 6.5_

  - [~] 6.5 Write property test — WebView asset resolution (Property 3)
    - **Property 3: WebView asset paths all resolve to existing files**
    - In `tests/unit/capacitor-sync.test.ts`, after `cap sync`, parse `android/app/src/main/assets/public/index.html` and for each asset `src`/`href`, assert the referenced file exists within the `android/app/src/main/assets/public/` tree
    - Use fast-check to vary the set of asset files present and confirm the property holds across combinations
    - Tag: `// Feature: desktop-mobile-packaging, Property 3: WebView asset resolution`
    - Minimum 100 iterations
    - **Validates: Requirements 5.4**

- [ ] 7. Implement artifact collection and manifest scripts
  - [~] 7.1 Create `scripts/collect-artifacts.js`
    - Create `scripts/collect-artifacts.js` as a CommonJS Node.js script
    - Read `version` from `package.json`
    - Define `APK_SRC = 'android/app/build/outputs/apk/debug/app-debug.apk'`
    - Define `APK_DEST = 'release/MeganD-{version}-debug.apk'`
    - Call `fs.mkdirSync('release', { recursive: true })` to create `release/` if absent
    - Call `fs.copyFileSync(APK_SRC, APK_DEST)` and log the destination path to stdout
    - _Requirements: 8.1, 8.3_

  - [~] 7.2 Create `scripts/manifest.js`
    - Create `scripts/manifest.js` as a CommonJS Node.js script
    - Implement `artifactEntry(filePath)`: if file exists, return `{ filename, size, sha256, status: 'success' }`; if absent, return `{ filename, status: 'failed' }` with no `size` or `sha256` fields
    - Compute SHA-256 using `crypto.createHash('sha256').update(buf).digest('hex')`
    - Build the manifest object: `{ version, buildTimestamp: new Date().toISOString(), artifacts: [...] }`
    - Write to `release/manifest.json` with `JSON.stringify(manifest, null, 2)`
    - Print the same JSON string to stdout with `console.log(json)` — the stdout output must be byte-for-byte identical to the file content
    - _Requirements: 8.2, 8.4, 8.5_

  - [~] 7.3 Write property test — manifest size accuracy (Property 5)
    - **Property 5: Manifest artifact size field equals actual file size**
    - In `tests/unit/manifest.test.ts`, use fast-check to generate random byte buffers, write them to temp files, run `artifactEntry`, and assert `size === buffer.length`
    - Tag: `// Feature: desktop-mobile-packaging, Property 5: Manifest artifact size accuracy`
    - Minimum 100 iterations
    - **Validates: Requirements 4.4, 6.3, 8.2**

  - [~] 7.4 Write property test — manifest present/absent status (Property 6)
    - **Property 6: Manifest correctly reflects present and absent artifacts**
    - In `tests/unit/manifest.test.ts`, use fast-check to generate all combinations of present/absent `.exe` and `.apk` files, run the manifest logic, and assert:
      - Present files → entry has `status: 'success'`, `filename`, `size`, `sha256`
      - Absent files → entry has `status: 'failed'`, `filename` only (no `size`, no `sha256`)
    - Tag: `// Feature: desktop-mobile-packaging, Property 6: Manifest present/absent status`
    - Minimum 100 iterations
    - **Validates: Requirements 8.4**

  - [~] 7.5 Write property test — manifest stdout equals file content (Property 7)
    - **Property 7: Manifest stdout output equals manifest file content**
    - In `tests/unit/manifest.test.ts`, use fast-check to vary manifest content (version strings, artifact entries), capture stdout via a spy, and assert the captured string is byte-for-byte identical to the content written to `release/manifest.json`
    - Tag: `// Feature: desktop-mobile-packaging, Property 7: Manifest stdout equals file`
    - Minimum 100 iterations
    - **Validates: Requirements 8.5**

  - [~] 7.6 Write property test — artifact filename pattern (Property 4)
    - **Property 4: Release artifact filenames match the versioned naming pattern**
    - In `tests/unit/manifest.test.ts`, use fast-check to generate semver-shaped version strings (e.g. `"1.0.0"`, `"2.3.14"`), run the filename construction logic, and assert the `.exe` filename matches `MeganD-{v}-setup.exe` and the `.apk` filename matches `MeganD-{v}-debug.apk`
    - Tag: `// Feature: desktop-mobile-packaging, Property 4: Artifact filename pattern`
    - Minimum 100 iterations
    - **Validates: Requirements 4.2, 8.3**

- [ ] 8. Add the full release orchestration and Gradle timeout wrapper
  - [~] 8.1 Create `scripts/build-android.js` with Gradle timeout wrapper
    - Create `scripts/build-android.js` as a CommonJS Node.js script
    - Spawn `./gradlew assembleDebug` inside the `android/` directory using `child_process.spawn`
    - Wrap the spawn with a 300-second timeout using `setTimeout`; if the process has not exited within 300 s, kill it and exit non-zero with the message `"Gradle build timed out after 300 seconds"`
    - On Gradle failure, inspect stderr for missing `ANDROID_HOME` and output the required SDK version and variable name; inspect for missing `JAVA_HOME` and output the required JDK version and variable name
    - On success, log the APK file path and size in bytes to stdout
    - _Requirements: 6.1, 6.3, 6.4, 6.6_

  - [~] 8.2 Add `release` npm script
    - In `package.json` `"scripts"`, add:
      - `"release": "npm run package:desktop && npm run cap:sync && node scripts/build-android.js && node scripts/collect-artifacts.js && node scripts/manifest.js"`
    - This sequences: desktop build → Capacitor sync → Android Gradle build → artifact collection → manifest
    - _Requirements: 8.1, 8.2_

  - [~] 8.3 Write unit test — pipeline guard ordering for Capacitor sync
    - In `tests/unit/pipeline-guards.test.ts`, assert that the `cap:sync` script definition in `package.json` invokes `npm run build` before `npx cap sync android`, confirming the guard ordering
    - _Requirements: 5.6_

- [~] 9. Checkpoint — scripts and manifest complete
  - Run `npx vitest --run` and confirm all unit and property tests pass with zero failures
  - Manually verify `scripts/manifest.js` produces valid JSON with correct structure when run against dummy artifact files in `release/`
  - Ask the user if any questions arise before proceeding to smoke tests

- [ ] 10. Implement desktop smoke test
  - [~] 10.1 Create `tests/smoke/reporter.ts` — shared diagnostic reporter
    - Create `tests/smoke/reporter.ts` as a TypeScript module
    - Export a `reportFailure(assertion: string, platform: 'desktop' | 'mobile', artifactPath: string): void` function that writes the failed assertion text, platform identifier, and absolute artifact path to stderr
    - This shared module is used by both smoke tests and is the subject of Property 12's property test
    - _Requirements: 7.5_

  - [~] 10.2 Create `tests/smoke/desktop.spec.ts`
    - Add `@playwright/test` with Electron support (`playwright`) as a devDependency with a pinned version
    - Create `tests/smoke/desktop.spec.ts`
    - Implement test `'desktop smoke — window opens and login screen renders'`:
      - Launch the Electron app with `electron.launch({ args: ['.'] })`
      - Assert a visible, non-minimised window is present within 10 seconds (Property 8)
      - Assert the DOM contains a username input, a password input, and a sign-in button (Property 9)
      - Assert zero JavaScript console messages with severity `error` or `fatal` were emitted during load (Property 9)
      - Close the app with `electronApp.close()`
    - Wrap each assertion in try/catch; on failure, call `reportFailure` from `reporter.ts` with the failed assertion text, `"desktop"`, and the absolute path of the artifact under test
    - Tag: `// Feature: desktop-mobile-packaging, Property 8 & 9`
    - _Requirements: 7.1, 7.2, 7.5_

  - [~] 10.3 Add `test:smoke:desktop` npm script
    - In `package.json` `"scripts"`, add `"test:smoke:desktop": "playwright test tests/smoke/desktop.spec.ts"`
    - _Requirements: 7.1, 7.2_

- [ ] 11. Implement Android smoke test
  - [~] 11.1 Create `tests/smoke/android.spec.ts`
    - Add `@wdio/cli` and `appium` as devDependencies with pinned versions
    - Create `tests/smoke/android.spec.ts`
    - Implement test `'android smoke — activity launches and WebView renders'`:
      - Install the APK on the connected emulator/device via Appium
      - Assert the main application activity reaches the foreground state within 15 seconds with no crash dialog and no ANR dialog (Property 10)
      - If the activity is in the foreground, assert the WebView contains at least one rendered child element and does NOT display a full-viewport white area (Property 11)
      - If the activity has not reached foreground within the timeout, mark the test as failed per Req 7.3 and skip the WebView check
    - Wrap each assertion in try/catch; on failure, call `reportFailure` from `reporter.ts` with the failed assertion text, `"mobile"`, and the absolute path of the `.apk` artifact under test
    - Tag: `// Feature: desktop-mobile-packaging, Property 10 & 11`
    - _Requirements: 7.3, 7.4, 7.5_

  - [~] 11.2 Add `test:smoke:android` npm script
    - In `package.json` `"scripts"`, add `"test:smoke:android": "npx wdio tests/smoke/android.spec.ts"`
    - _Requirements: 7.3, 7.4_

  - [~] 11.3 Write property test — smoke test error output format (Property 12)
    - **Property 12: Smoke test failure output contains required diagnostic fields**
    - In `tests/unit/smoke-reporter.test.ts`, import `reportFailure` from `tests/smoke/reporter.ts`
    - Use fast-check to generate arbitrary failure messages, platform IDs (`"desktop"` | `"mobile"`), and artifact paths, call `reportFailure`, and assert the stderr output contains all three fields
    - Tag: `// Feature: desktop-mobile-packaging, Property 12: Smoke test error output`
    - Minimum 100 iterations
    - **Validates: Requirements 7.5**

- [ ] 12. Implement GitHub Actions release workflow
  - [~] 12.1 Create `.github/workflows/release.yml`
    - Create `.github/workflows/release.yml` at the project root
    - Set trigger: `on: push: tags: ['v*.*.*']` — fires only on semver version tags; branch pushes, PR events, and non-version tags do NOT trigger the workflow
    - Define `build-desktop` job on `windows-latest`:
      - `actions/checkout@v4`
      - `actions/setup-node@v4` with `node-version-file: '.nvmrc'`
      - `npm ci`
      - `npm run package:desktop` (produces `release/MeganD-{version}-setup.exe`)
      - `actions/upload-artifact@v4` with `name: desktop-installer`, `path: release/MeganD-*-setup.exe`
    - Define `build-android` job on `ubuntu-latest`:
      - `actions/checkout@v4`
      - `actions/setup-node@v4` with `node-version-file: '.nvmrc'`
      - `actions/setup-java@v4` with `distribution: temurin`, `java-version: '17'`
      - `npm ci`
      - `npm run cap:sync`
      - `node scripts/build-android.js`
      - `node scripts/collect-artifacts.js`
      - `actions/upload-artifact@v4` with `name: android-apk`, `path: release/MeganD-*-debug.apk`
    - Define `publish-release` job on `ubuntu-latest` with `needs: [build-desktop, build-android]`:
      - `actions/checkout@v4`
      - `actions/download-artifact@v4` for `desktop-installer` into `release/`
      - `actions/download-artifact@v4` for `android-apk` into `release/`
      - `node scripts/manifest.js` (generates `release/manifest.json` and prints it to stdout)
      - `softprops/action-gh-release@v2` with `tag_name: ${{ github.ref_name }}`, `name: Megan_D ${{ github.ref_name }}`, `body_path: release/manifest.json`, files glob matching both artifacts and `manifest.json`, `token: ${{ secrets.GITHUB_TOKEN }}`
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10_

  - [~] 12.2 Write unit test — workflow trigger pattern (Property 13)
    - **Property 13: CI workflow only triggers on version tags**
    - In `tests/unit/workflow-config.test.ts`, read `.github/workflows/release.yml` as text (using `js-yaml` or plain string matching) and assert:
      - The `on.push.tags` array contains exactly `'v*.*.*'`
      - There is no `on.push.branches` key (branch pushes do not trigger the workflow)
      - There is no `on.pull_request` key
    - Tag: `// Feature: desktop-mobile-packaging, Property 13: CI workflow only triggers on version tags`
    - **Validates: Requirements 9.2**

- [~] 13. Final checkpoint — full pipeline verified
  - Run `npx vitest --run` and confirm all unit and property tests pass with zero failures
  - Verify `package.json` contains all required scripts: `build`, `electron:dev`, `package:desktop`, `cap:sync`, `build:android`, `release`, `test:smoke:desktop`, `test:smoke:android`
  - Verify the directory structure matches the design: `electron/`, `scripts/`, `tests/smoke/`, `tests/unit/`, `capacitor.config.ts`, `vitest.config.ts`, `.github/workflows/release.yml` all present at project root
  - Confirm `src/` is completely unmodified (zero files added, removed, or changed inside `src/`)
  - Ask the user if any questions arise before declaring the feature complete

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP; all core implementation tasks are mandatory
- All new files live outside `src/` — the zero-source-modification constraint is a hard requirement enforced throughout
- Property tests use **fast-check** with a minimum of 100 iterations each; they are co-located with the implementation tasks they validate to catch errors early
- Smoke tests (Tasks 10–11) require a full Electron or Android emulator environment and are intentionally excluded from the `vitest` unit test run
- The Gradle timeout wrapper is now its own script (`scripts/build-android.js`, Task 8.1) rather than embedded in `collect-artifacts.js`, keeping each script's responsibility focused
- `android/` is generated by `npx cap add android` and should not be committed to source control; `android/variables.gradle` (Task 6.2) is written after generation to lock the SDK versions

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1", "2.2", "2.3", "2.4", "2.5"] },
    { "id": 1, "tasks": ["1.2", "1.3", "3.1", "3.2", "4.1", "6.1"] },
    { "id": 2, "tasks": ["3.3", "4.2", "4.3", "6.2"] },
    { "id": 3, "tasks": ["6.3", "6.4", "7.1", "7.2"] },
    { "id": 4, "tasks": ["6.5", "7.3", "7.4", "7.5", "7.6", "8.1"] },
    { "id": 5, "tasks": ["8.2", "8.3", "10.1"] },
    { "id": 6, "tasks": ["10.2", "10.3", "11.1", "11.2"] },
    { "id": 7, "tasks": ["11.3"] },
    { "id": 8, "tasks": ["12.1"] },
    { "id": 9, "tasks": ["12.2"] }
  ]
}
```

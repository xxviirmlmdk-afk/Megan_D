# Requirements Document

## Introduction

This feature packages the Megan_D Security Operations Platform — a React 18 + TypeScript + Vite SPA — for distribution beyond the browser. The goal is to produce two distributable artifacts from the existing codebase:

1. A **Windows desktop installer** (`.exe`) wrapping the app in Electron
2. An **Android mobile package** (`.apk`) wrapping the app via Capacitor

The existing source code, routing, state management, and UI must remain unchanged. The packaging layer sits on top of the existing Vite build output.

---

## Glossary

- **Build_System**: The Vite-based toolchain that compiles the React/TypeScript source into a static web bundle (`dist/`)
- **Electron_Wrapper**: The Electron main process and configuration that hosts the Vite `dist/` output in a desktop window
- **Capacitor_Wrapper**: The Capacitor native project (Android) that wraps the Vite `dist/` output in a WebView
- **Desktop_Installer**: The Windows `.exe` installer artifact produced by electron-builder
- **Mobile_Package**: The Android `.apk` artifact produced by the Capacitor + Gradle build pipeline
- **Dependency_Manager**: npm, responsible for installing and resolving all project dependencies
- **Packaging_Pipeline**: The end-to-end sequence of steps from source to distributable artifact
- **Smoke_Test**: A minimal launch verification confirming the app window opens and the login screen renders without errors
- **Release_Artifact**: A versioned, distributable file (`.exe` or `.apk`) ready for end-user installation

---

## Requirements

### Requirement 1: Vite Production Build

**User Story:** As a release engineer, I want to compile the React/TypeScript source into an optimised static bundle, so that the desktop and mobile wrappers have a production-ready web asset to embed.

#### Acceptance Criteria

1. WHEN the build command is executed, THE Build_System SHALL compile all TypeScript source files under `src/` without type errors, missing module errors, or unresolvable import errors
2. WHEN the build command is executed, THE Build_System SHALL emit all output files into the `dist/` directory
3. WHEN the build command is executed, THE Build_System SHALL bundle and minify JavaScript, CSS, and static assets into the `dist/` directory
4. IF the build encounters any error (type error, missing module, unresolvable import, or other compile-time failure), THEN THE Build_System SHALL halt the build, set the build result to failure, and output the error with file path and line number
5. WHEN the build completes successfully, THE Build_System SHALL produce an `index.html` entry point in `dist/` that references all bundled assets using relative paths
6. WHEN the build completes successfully, THE Build_System SHALL NOT emit source map files (`.map`) into the `dist/` directory

---

### Requirement 2: Dependency Resolution

**User Story:** As a release engineer, I want all npm dependencies installed and resolved before packaging begins, so that the build and packaging steps do not fail due to missing modules.

#### Acceptance Criteria

1. WHILE the Packaging_Pipeline is actively executing a build or packaging phase, THE Dependency_Manager SHALL ensure all dependencies declared in `package.json` are installed before that phase begins
2. WHEN a dependency version conflict is detected — defined as two or more declarations requiring the same package name with incompatible semver ranges — THE Dependency_Manager SHALL report the conflicting package names and their incompatible version ranges, and SHALL halt the pipeline with a non-zero exit code before any build or packaging step executes
3. WHEN the packaging setup command is executed, THE Dependency_Manager SHALL install Electron, electron-builder, Capacitor CLI, and the Capacitor Android platform as `devDependencies` in `package.json` without adding, removing, or modifying any entry in the `dependencies` section
4. WHEN dependencies are installed successfully, THE Dependency_Manager SHALL produce a `node_modules/` directory containing all packages declared in `package.json`

---

### Requirement 3: Electron Desktop Wrapper

**User Story:** As a release engineer, I want the Vite build output wrapped in an Electron shell, so that the app can run as a native desktop application on Windows without requiring a browser.

#### Acceptance Criteria

1. THE Electron_Wrapper SHALL include a main process entry file at `electron/main.js` that creates a `BrowserWindow` and loads the `dist/index.html` file using `loadFile`
2. WHEN the Electron application launches, THE Electron_Wrapper SHALL open a window with a minimum width of 1024 pixels and a minimum height of 768 pixels, and SHALL enforce these minimums if the user attempts to resize the window below them
3. WHEN the Electron application launches, THE Electron_Wrapper SHALL display the Megan_D login screen — defined as the view containing the username input, password input, and sign-in button — as the initial view without requiring any user interaction
4. WHEN all application windows are closed by the user, THE Electron_Wrapper SHALL terminate the application process with exit code 0
5. THE Electron_Wrapper SHALL set `nodeIntegration: false` and `contextIsolation: true` in the `BrowserWindow` `webPreferences` to prevent renderer-side access to Node.js APIs
6. IF the `dist/index.html` file is not found at launch, THEN THE Electron_Wrapper SHALL display a modal error dialog with the message "Build output missing: dist/index.html not found. Please run the build command before launching." and SHALL exit the process with a non-zero exit code only after the dialog has been dismissed

---

### Requirement 4: Desktop Installer Build

**User Story:** As a release engineer, I want electron-builder to package the Electron app into a Windows `.exe` installer, so that end users can install Megan_D on Windows with a standard installer experience.

#### Acceptance Criteria

1. WHEN the desktop packaging command is executed, THE Packaging_Pipeline SHALL invoke electron-builder to produce a Windows NSIS `.exe` installer in the `release/` output directory
2. WHEN the installer is built, THE Desktop_Installer SHALL embed the application name "Megan_D", the publisher name, and a version number derived from the `version` field in `package.json`
3. WHEN the installer is built, THE Desktop_Installer SHALL include all files from the `dist/` directory and the Electron main process entry point and any preload scripts declared in `package.json`
4. WHEN the desktop packaging command completes successfully, THE Packaging_Pipeline SHALL report the file path and size in bytes of the produced `.exe` artifact
5. IF electron-builder is invoked without a code-signing certificate configured, THEN THE Packaging_Pipeline SHALL produce an unsigned `.exe` installer and emit a warning message stating the installer is unsigned
6. IF the `dist/` directory is absent or empty when the desktop packaging command is executed, THEN THE Packaging_Pipeline SHALL halt with a non-zero exit code and output an error message stating that the Vite build must be run first

---

### Requirement 5: Capacitor Android Wrapper

**User Story:** As a release engineer, I want the Vite build output wrapped in a Capacitor Android project, so that the app can be distributed as an Android APK without rewriting the codebase in React Native.

#### Acceptance Criteria

1. THE Capacitor_Wrapper SHALL be initialised with the app name "Megan_D" and a package ID of `com.megand.secops`, configured in `capacitor.config.ts` at the project root
2. WHEN the Capacitor sync command is executed, THE Capacitor_Wrapper SHALL copy the contents of `dist/` into the Android project's web assets directory (`android/app/src/main/assets/public/`)
3. WHEN the Capacitor sync command is executed, THE Capacitor_Wrapper SHALL update the Android project's native dependencies to match the installed Capacitor plugin versions
4. THE Capacitor_Wrapper SHALL configure the Android WebView so that the embedded `index.html` and all its referenced assets load without producing any failed resource load errors in the WebView console
5. WHEN the Capacitor sync command completes, THE Capacitor_Wrapper SHALL produce an Android Gradle project under `android/` such that running `./gradlew assembleDebug` inside `android/` completes without errors
6. IF the `dist/` directory is absent or empty when the Capacitor sync command is executed, THEN THE Capacitor_Wrapper SHALL halt with a non-zero exit code and output an error message stating that the Vite build must be run before syncing

---

### Requirement 6: Android APK Build

**User Story:** As a release engineer, I want the Capacitor Android project compiled into a debug `.apk`, so that the app can be installed and tested on Android devices or emulators.

#### Acceptance Criteria

1. WHEN the Android build command is executed, THE Packaging_Pipeline SHALL invoke the Gradle wrapper (`./gradlew assembleDebug`) inside the `android/` directory to assemble a debug APK
2. WHEN the APK build completes successfully, THE Mobile_Package SHALL be located at `android/app/build/outputs/apk/debug/app-debug.apk`
3. WHEN the APK build completes successfully, THE Packaging_Pipeline SHALL report the file path and size in bytes of the produced `.apk` artifact
4. IF the Gradle build fails due to a missing Android SDK, THEN THE Packaging_Pipeline SHALL output an error message specifying the required SDK version and that the `ANDROID_HOME` environment variable must be set; IF the Gradle build fails due to a missing JDK, THEN THE Packaging_Pipeline SHALL output an error message specifying the required JDK version and that the `JAVA_HOME` environment variable must be set
5. THE Mobile_Package SHALL target Android API level 24 (Android 7.0) as the minimum supported version (`minSdkVersion 24` in the Gradle build configuration)
6. IF the Android build command has not produced a completed APK within 300 seconds, THEN THE Packaging_Pipeline SHALL terminate the Gradle process and halt with a non-zero exit code and a timeout error message

---

### Requirement 7: Installation Smoke Tests

**User Story:** As a release engineer, I want automated smoke tests that verify the `.exe` and `.apk` launch successfully, so that I can confirm the packaged artifacts are functional before release.

#### Acceptance Criteria

1. WHEN the desktop smoke test is executed against the installed `.exe`, THE Smoke_Test SHALL verify that the Electron window process is active and a non-minimised, visible window frame is present on screen within 10 seconds of launch
2. WHEN the desktop smoke test is executed, THE Smoke_Test SHALL verify that the login screen — defined as the DOM containing the username input, password input, and sign-in button — is present and visible in the Electron window, and SHALL fail the test if any JavaScript console message with severity `error` or `fatal` is emitted during load, regardless of whether the login screen is visually present
3. WHEN the mobile smoke test is executed against the installed `.apk` on an Android emulator or device, THE Smoke_Test SHALL verify that the main application activity has reached the foreground state with no crash dialog or ANR dialog present within 15 seconds of launch
4. IF the main application activity has reached the foreground state, THEN THE Smoke_Test SHALL verify that the WebView does not display a full-viewport white area with no rendered child elements; IF the main activity has not reached the foreground state within the timeout, THEN criterion 4 SHALL be skipped and the test SHALL be marked as failed by criterion 3
5. IF a smoke test fails, THEN THE Smoke_Test SHALL output the failed assertion text, the platform identifier ("desktop" or "mobile"), and the absolute file path of the artifact under test

---

### Requirement 8: Release Artifact Delivery

**User Story:** As a release engineer, I want both distributable artifacts collected in a single release directory with a manifest, so that I can identify, version, and distribute the correct builds.

#### Acceptance Criteria

1. WHEN the full Packaging_Pipeline completes successfully, THE Packaging_Pipeline SHALL place both the `.exe` installer and the `.apk` file in a `release/` directory at the project root, creating the directory if it does not exist and overwriting any existing files with the same names
2. WHEN the full Packaging_Pipeline completes successfully, THE Packaging_Pipeline SHALL write a `release/manifest.json` file containing the artifact filenames, file sizes in bytes, SHA-256 checksums, build timestamp in ISO 8601 UTC format, and the application version string
3. THE Release_Artifact filenames SHALL follow the pattern `MeganD-{version}-setup.exe` and `MeganD-{version}-debug.apk`
4. IF either artifact is missing when the manifest is written, THEN THE Packaging_Pipeline SHALL include that artifact's entry in `manifest.json` with its filename and `"status": "failed"`, while present artifacts SHALL be recorded with their filename, file size in bytes, SHA-256 checksum, and `"status": "success"`
5. WHEN the manifest is written, THE Packaging_Pipeline SHALL print the full JSON text of the `release/manifest.json` file to standard output

---

### Requirement 9: GitHub Actions Release Workflow

**User Story:** As a release engineer, I want a GitHub Actions workflow that automatically builds and publishes both the `.exe` and `.apk` artifacts as GitHub Release assets when a version tag is pushed, so that end users can download versioned builds directly from the GitHub Releases page without requiring a manual build environment.

#### Acceptance Criteria

1. THE Packaging_Pipeline SHALL include a GitHub Actions workflow file at `.github/workflows/release.yml` that defines the automated release process
2. WHEN a Git tag matching the pattern `v*.*.*` is pushed to the repository, THE Packaging_Pipeline SHALL trigger the release workflow automatically and SHALL NOT trigger on any other push event
3. WHEN the release workflow is triggered, THE Packaging_Pipeline SHALL run the Windows `.exe` build job on a `windows-latest` GitHub Actions runner using electron-builder
4. WHEN the release workflow is triggered, THE Packaging_Pipeline SHALL run the Android `.apk` build job on an `ubuntu-latest` GitHub Actions runner using the Android SDK and Gradle
5. WHEN the release workflow is triggered, THE Packaging_Pipeline SHALL execute the Windows build job and the Android build job in parallel, with both jobs starting after the triggering tag event and neither job depending on the other's completion
6. WHEN both build jobs complete successfully, THE Packaging_Pipeline SHALL create a GitHub Release for the pushed tag and upload both `MeganD-{version}-setup.exe` and `MeganD-{version}-debug.apk` as downloadable assets attached to that release
7. WHEN the GitHub Release is created, THE Packaging_Pipeline SHALL include the full contents of `release/manifest.json` as the body text of the release notes
8. THE Packaging_Pipeline SHALL authenticate all GitHub API operations — including release creation and asset upload — using the `GITHUB_TOKEN` secret provided automatically by GitHub Actions, and SHALL NOT require any additional secrets or manually configured credentials for unsigned builds
9. WHEN the GitHub Release is published, THE Release_Artifact download URLs SHALL follow the GitHub Releases asset URL pattern `https://github.com/{owner}/{repo}/releases/download/{tag}/MeganD-{version}-setup.exe` and `https://github.com/{owner}/{repo}/releases/download/{tag}/MeganD-{version}-debug.apk`
10. IF either build job fails, THEN THE Packaging_Pipeline SHALL not create a GitHub Release and SHALL report the failed job name and exit code in the workflow run summary

# Project Structure

All source code lives under `src/`. There is no `src/index.ts` barrel — imports use direct relative paths.

```
src/
├── App.tsx                  # Root component: provider tree, routing, global state (scanResults, vulnerabilities)
├── components/
│   ├── Header.tsx           # Top bar with page title, search, notifications button, user avatar
│   ├── Sidebar.tsx          # Left nav with page links and system status indicator
│   ├── Notifications.tsx    # Floating bell button + notification panel (reads NotificationContext)
│   └── ui/                  # shadcn/ui primitives (Card, Button, Input, Label, etc.) — do not modify
├── context/
│   ├── AuthContext.tsx      # User session, login/logout, role-based hasPermission()
│   ├── AuditContext.tsx     # Action logging (logAction); depends on AuthContext
│   ├── NotificationContext.tsx  # In-app notification queue (addNotification, markAsRead, etc.)
│   └── ThemeContext.tsx     # dark/light theme toggle, persisted to localStorage
├── pages/
│   ├── Dashboard.tsx        # Stats overview, activity chart, recent activity, quick actions
│   ├── HostChecker.tsx      # Host/IP scan UI; calls performHostScan(), lifts result to App via onScanComplete
│   ├── ThreatIntel.tsx      # Multi-source threat intel query UI; calls queryThreatIntel()
│   ├── PayloadEngine.tsx    # Payload generation UI; calls generatePayload()
│   ├── AgentSystem.tsx      # AI analysis UI; calls generateRemediation(); receives vulnerabilities prop
│   ├── ScanHistory.tsx      # Table view of scanResults prop passed from App
│   ├── Reports.tsx          # Aggregated reporting view of scanResults + vulnerabilities props
│   ├── Settings.tsx         # API key config, scan settings, system status
│   └── Login.tsx            # Credential form + simulated Google OAuth; calls useAuth().login()
└── utils/
    ├── aiAgent.ts           # generateRemediation(), generateTestCode() — returns remediation steps + test code
    ├── hostScanner.ts       # performHostScan() — returns HostScanResult (simulated)
    ├── payloadGenerator.ts  # generatePayload(), vulnerabilityTypes constant
    ├── threatIntel.ts       # queryThreatIntel(), threatIntelSources constant
    └── exportUtils.ts       # Export helpers (CSV/JSON)
```

> Note: duplicate `.tsx` versions exist alongside some `.ts` utils (e.g. `aiAgent.tsx`, `hostScanner.tsx`). Prefer the `.ts` versions for pure logic; the `.tsx` variants may contain UI fragments and should be consolidated or removed.

## Routing

Navigation is **state-based**, not URL-based. `App.tsx` holds `currentPage` string state and renders the matching page component via a `switch` statement. There is no React Router.

## Data Flow

- Global scan data (`scanResults`, `vulnerabilities`) lives in `App.tsx` and flows **down as props** to pages that need it.
- Pages that produce scan results call `onScanComplete` prop to lift data back up to `App.tsx`.
- Cross-cutting concerns (auth, notifications, audit, theme) are accessed via their respective **Context hooks**.

## Context Provider Order

Providers are nested in this order in `App.tsx` (outermost first):

```
ThemeProvider → AuthProvider → NotificationProvider → AuditProvider
```

`AuditContext` depends on `AuthContext`, so it must be nested inside `AuthProvider`.

## Adding a New Page

1. Create `src/pages/MyPage.tsx` with a default export
2. Import and add a `case` in the `renderPage()` switch in `App.tsx`
3. Add a nav entry to the `navItems` array in `Sidebar.tsx`
4. Add a title entry to `pageTitles` in `Header.tsx`

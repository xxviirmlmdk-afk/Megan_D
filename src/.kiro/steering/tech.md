# Tech Stack

## Framework & Language
- **React 18** with **TypeScript** — all components use `.tsx`, all utilities use `.ts`
- **Vite** — assumed build tool based on project structure (config files outside workspace root)

## UI
- **Tailwind CSS** — utility-first styling, dark theme by default (`slate-950` base)
- **shadcn/ui** — component library sourced from `components/ui/` (Card, Button, Input, Label, etc.)
- **lucide-react** — icon library used throughout; import icons individually by name

## State Management
- **React Context API** — all global state lives in `src/context/`. No Redux or Zustand.
- **localStorage** — used for persisting auth session (`megand_user`) and theme preference (`megand_theme`)
- **In-memory state** — scan results and vulnerabilities are held in `App.tsx` state and passed as props; no external store or database

## Key Libraries (inferred)
- `react`, `react-dom`
- `lucide-react`
- `tailwindcss`
- shadcn/ui components (Radix UI primitives under the hood)

## Common Commands
> Config files are outside the workspace root. Run these from the project root (parent of `src/`).

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Type checking
npx tsc --noEmit
```

## Code Conventions
- Functional components only — no class components
- Named exports for contexts and hooks; default exports for page and component files
- Props interfaces defined inline above the component that uses them
- Async operations simulated with `setTimeout` + `Promise` — no real API calls currently
- All context hooks throw if used outside their provider (enforced with guard check)

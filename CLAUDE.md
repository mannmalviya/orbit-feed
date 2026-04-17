# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Vite dev server (hot reload)
npm run build     # tsc + vite build (both must pass before an increment is done)
npm run preview   # serve the production build locally
```

No lint or test scripts exist yet. TypeScript strict mode is enforced via `tsc` in `npm run build`.

## Required environment variable

Copy `.env.local` (not committed) with:

```
VITE_NEWS_API_KEY=your_key_here
```

Get a free key at newsapi.org. The free tier only works from `localhost` — CORS blocks production origins.

## Architecture

### Data flow

```
App (selected: SelectedCountry | null)
 ├── GlobeView   — renders globe, fires onCountryClick({ name, iso2 })
 └── NewsPanel   — shown when selected !== null; fetches from NewsAPI on each country change
```

`SelectedCountry` (in `src/types.ts`) is the only shared type: `{ name: string; iso2: string }`.

### GlobeView (`src/GlobeView.tsx`)

- Wraps `react-globe.gl`, which wraps three.js. The `globeRef` (type `GlobeMethods`) gives access to the underlying renderer and OrbitControls.
- **Day/night shader**: a custom `THREE.ShaderMaterial` is created once (`useMemo`) and passed as `globeMaterial`. Two GLSL uniforms — `dayTexture` and `nightTexture` — are blended based on `vSunDot` (dot product of the surface normal with the sun direction vector). `getSunDirection()` recomputes the sun position every second via `setInterval`.
- **Auto-rotate**: enabled via `OrbitControls.autoRotate` inside `onGlobeReady`. Pointerdown/pointerup events on the canvas pause/resume rotation. Cleanup is stored in `cleanupRotate.current`.
- Country polygons are fetched once from a static GeoJSON hosted on the `react-globe.gl` GitHub repo.
- Hover state (`hovered`) drives polygon altitude (0.02 elevated vs 0.006 flat) and cap colour.

### NewsPanel (`src/NewsPanel.tsx`)

- Uses a discriminated union `FetchState` (`idle | loading | ok | error`) to model all render states.
- Calls the NewsAPI `/v2/everything` endpoint (not `/top-headlines`) because `/top-headlines?country=` only covers ~55 codes — `everything?q=<name>` works for any country.
- Error messages are short sentinel strings (`'no-key'`, `'cors-block'`) matched in JSX to show specific guidance.
- A `cancelled` flag guards against stale async updates when the component re-renders with a new country before the previous fetch resolves.

## Project roadmap

See `.claude/PLAN.md` for the incremental roadmap (what's done and what's next).

## Conventions

- Functional components + hooks only.
- One component per file. Colocate component-specific CSS if it grows (see `NewsPanel.css`).
- `src/` stays flat until there's a real reason to nest.
- Prefer `type` over `interface` for local shapes; `interface` is fine for public/extensible APIs.
- No premature abstractions — duplicate twice before extracting.

## Git workflow

- Each increment lives on its own branch; merge to `main` via PR only (`gh pr create`).
- Branch naming: `<type>/<short-kebab-description>` (e.g. `feat/country-search`, `fix/terminator-offset`).
- Use the `github` subagent (`.claude/agents/github.md`) to commit and push — don't hand-roll git commands in the main thread.
- Stage specific paths, not `git add -A`. Never stage `.env*`, `dist/`, or `node_modules/`.
- Commit subject: imperative, ≤ 72 chars, conventional-commit prefix where it fits. Body explains *why*. Always add `Co-Authored-By: Claude Code <noreply@anthropic.com>` trailer.

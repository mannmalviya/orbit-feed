# orbit-feed — project instructions

Read `.claude/PLAN.md` for the incremental roadmap. This file is for *how* we work; `PLAN.md` is for *what* we're building.

## Stack
- React 18 + Vite + TypeScript
- `react-globe.gl` for the 3D globe (wraps three.js)
- No CSS framework yet — plain CSS, kept minimal.

## Conventions
- Functional components + hooks only. No class components.
- One component per file. Colocate component-specific CSS if it grows.
- Keep `src/` flat until there's a real reason to nest (e.g. `src/news/` once Increment 2 lands).
- TypeScript strict mode. Prefer `type` over `interface` for local shapes; `interface` is fine for public/extensible APIs.
- No premature abstractions. Duplicate twice before extracting.

## Dev commands
- `npm run dev` — start Vite dev server
- `npm run build` — production build (runs `tsc` first)
- `npm run preview` — preview the production build

## Secrets
- Never commit API keys. Use `.env.local` with `VITE_`-prefixed vars (exposed to the client — fine for public-facing keys, not fine for anything server-only).
- When we add a news API in Increment 2, document the env var here.

## Working on this repo
- When finishing an increment, update `.claude/PLAN.md` (move it under "Done", add date + one-line note) before moving on.
- Before calling an increment done, run `npm run build` and verify the behavior in a browser — TS passing alone is not enough.
- Keep diffs focused on the current increment. Don't refactor earlier increments unless it's needed for the current one.

## Git workflow

- Use the `github` subagent (`.claude/agents/github.md`) to commit, push, and manage branches. Don't hand-roll git commands in the main thread — delegate so rules stay consistent.
- Invoke it at these checkpoints: after finishing an increment, after a standalone fix/refactor, or whenever the user says "commit and push" / "push this".
- Don't commit speculative or half-finished work. If a change isn't ready, leave it uncommitted.
- **Each increment lives on its own branch.** Never commit feature work directly to `main`.
- Merge to `main` via PR only (use `gh pr create`). Don't `git merge` locally.

### Branch naming
- Pattern: `<type>/<short-kebab-description>`
- Types mirror conventional-commit prefixes: `feat`, `fix`, `refactor`, `chore`, `docs`
- Keep the description ≤ 4 words, all lowercase, hyphens only (no slashes or dots inside)
- Examples:
  - `feat/news-panel` — new feature increment
  - `fix/terminator-longitude-offset` — bug fix
  - `chore/upgrade-three` — dependency bump
  - `refactor/globe-view-split` — internal cleanup
- Branch off `main` unless you're stacking on an existing feature branch
- Delete the branch after the PR is merged

### Commit message rules
  - Imperative subject ≤ 72 chars, no trailing period.
  - Conventional-commit prefix when it fits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:`, `build:`); omit for tiny changes.
  - Body explains *why*, not *what* — and only when the subject isn't enough.
  - Always end with a blank line + `Co-Authored-By: Claude Code <noreply@anthropic.com>` trailer.
- Never force-push, never `--no-verify`, never `--amend` a pushed commit. Fix hook failures at the root and make a new commit.
- Stage specific paths (`git add src/foo.ts`), not `git add -A`. Never stage `.env*`, credentials, `dist/`, or `node_modules/`.

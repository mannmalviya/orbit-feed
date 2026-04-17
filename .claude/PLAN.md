# orbit-feed — Incremental Plan

Vision: a 3D globe you can drag to rotate. Click a country → see the most relevant news for that country right now.

We build this one increment at a time. Finish an increment, verify it in the browser, mark it done, then plan the next.

## Increments

### Increment 1 — Interactive globe (in progress)
- Scaffold Vite + React + TypeScript app.
- Render a draggable 3D globe with country polygons (`react-globe.gl`).
- Hover highlights the country under the cursor.
- Clicking a country logs its name to the devtools console.

**Done when:** globe renders, drag/zoom work, hover/click produce visible/console feedback, `npm run build` passes.

### Increment 2 — News panel (next)
- Side panel opens when a country is clicked.
- Fetch top news for that country from a news API.
- Show headline, source, publish time, link out to article.
- Decide on API (NewsAPI / GDELT / GNews / other) and key handling via `.env.local`.

### Increment 3+ (later, rough order)
- Topic/category filters on the news panel.
- Country search box (fly-to on select).
- URL state (shareable "selected country" links).
- Visual polish: atmosphere, country labels, better hover/selected states.
- Mobile/touch polish and accessibility pass.
- Tests once there's non-trivial logic worth pinning down.

## How to update this file
Whenever an increment is completed, move it to a "Done" section with the date and a one-line note on what shipped. Keep the next increment concrete; leave later ones rough.

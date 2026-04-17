# orbit-feed — Incremental Plan

Vision: a 3D globe you can drag to rotate. Click a country → see the most relevant news for that country right now.

We build this one increment at a time. Finish an increment, verify it in the browser, mark it done, then plan the next.

## Increments

### Increment 3 — (next, rough)
- Topic/category filters on the news panel.
- Country search box (fly-to on select).
- URL state (shareable "selected country" links).
- Visual polish: country labels, better selected-country highlight.
- Mobile/touch polish and accessibility pass.
- Tests once there's non-trivial logic worth pinning down.

## Done

### Increment 1 — Interactive globe (2026-04-16)
Draggable 3D globe with country polygons; hover highlights, click logs name to console.

### Increment 2 — Live day/night + news panel (2026-04-16)
- GLSL shader blends day/night earth textures based on real-time sun position (updates every second).
- Clicking a country opens a right-side panel that fetches top headlines from NewsAPI.org.
- Panel shows headline, source, relative publish time, links out to article.
- API key read from `VITE_NEWS_API_KEY` in `.env.local`; graceful error states for missing key, unsupported regions, and CORS blocks.

## How to update this file
Whenever an increment is completed, move it to the "Done" section with the date and a one-line note on what shipped. Keep the next increment concrete; leave later ones rough.

## Setup note — news API
Add to `.env.local` (not committed):
```
VITE_NEWS_API_KEY=your_key_here
```
Get a free key at https://newsapi.org. The free tier works from localhost only.

# orbit-feed

An interactive 3D globe that shows live top headlines for any country you click. Drag to rotate, scroll to zoom, click a country to see its news.

## Features

- 3D draggable globe with country boundaries
- Live day/night terminator based on real sun position
- Click any country to open a news panel with current headlines

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Add your NewsAPI key

Create a `.env.local` file in the project root (this file is gitignored):

```text
VITE_NEWS_API_KEY=your_key_here
```

Get a free key at [newsapi.org](https://newsapi.org). The free tier works from `localhost` only — you'll need a paid plan to deploy publicly.

### 3. Start the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Other commands

```bash
npm run build    # production build (runs tsc first)
npm run preview  # preview the production build locally
```

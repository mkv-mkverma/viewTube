# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Vite dev server — required for search suggestions (see CORS below)
npm run build     # tsc -b && vite build — typecheck is part of the build and gates deploys
npm run lint      # eslint
npm run preview   # serve the production build
```

There is no test framework in this project — no test runner, config, or test files exist.

## Architecture

React 19 + TypeScript + Vite + Tailwind v4 + Redux Toolkit. YouTube clone, deployed to GitHub Pages. [README.md](README.md) documents each feature in depth; [SETUP.md](SETUP.md) records the scaffolding steps.

Layout is a nested router: `App` mounts `<Provider>` + `<Head>` + `RouterProvider`; `Body` is the layout route (Sidebar + `<Outlet />`) with `MainContainer` at `/` and `WatchPage` at `/watch?v=<id>`.

Store shape (`src/utils/store.tsx`, which exports `RootState`):

```ts
{ app: { isMenuOpen: boolean }, search: Record<string, string[]> }
```

### Search suggestions have two transports

`src/utils/suggestions.tsx` is the most environment-sensitive code here. Google's suggest endpoint sends no CORS headers, so:

- **Dev** — `fetch` through the Vite proxy (`/api/youtube-suggestions`, configured in `vite.config.ts`), using `client=firefox`.
- **Prod** — JSONP via an injected `<script>` tag, using `client=youtube`. GitHub Pages is static, so there is no proxy to use.

The two clients return **different response shapes**; both are normalised to `string[]` inside this file so callers stay transport-agnostic. Changing the URL, the `client` param, or the parsing on one path usually means changing the other. The branch is `import.meta.env.DEV`, so the JSONP path is never exercised by `npm run dev` — verify it with `npm run build && npm run preview`.

### GitHub Pages constraints

`.github/workflows/deploy.yml` builds with `--base=/viewTube/` and copies `dist/index.html` to `dist/404.html` as the SPA fallback for deep links. The router's `basename` is `import.meta.env.BASE_URL` to match. Anything that assumes the app is served from `/` will break in production.

### Conventions

- Util modules use the `.tsx` extension even without JSX (`store.tsx`, `constant.tsx`, `suggestions.tsx`) — match this when adding files to `src/utils/`.
- Components are arrow functions with a default export, one per file, in `src/component/` (singular).
- Async work lives in `useEffect` with a cleanup that tears down what it started (`clearTimeout` for the 300ms search debounce in `Head.tsx`, `clearInterval` for the 1s live-chat polling in `LiveChat.tsx`). Use the `prev =>` updater form in these — the interval closure would otherwise capture stale state.

### Known gaps

The README's "Known gaps / TODO" section lists deliberate incompleteness — search submit is a no-op, comments and category chips are hardcoded, the suggestion cache is an unbounded object rather than a real LRU, and the API key is committed in `src/utils/constant.tsx`. Treat these as known, not as bugs to fix incidentally; update that list when one is resolved.

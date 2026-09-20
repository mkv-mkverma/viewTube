# ViewTube

A YouTube clone built with **React 19 + TypeScript + Vite + Tailwind v4 + Redux Toolkit**, deployed to GitHub Pages.

It is a learning project, so this README doubles as the map of *what is implemented and why* — debouncing, a search cache, polling-based live chat, recursive comments, HOC, and the deployment plumbing. Setup steps (how the project was scaffolded) live in [SETUP.md](SETUP.md).

---

## Table of Contents

- [Run it](#run-it)
- [What's implemented](#whats-implemented)
- [Architecture](#architecture)
- [File map](#file-map)
- [Feature deep dives](#feature-deep-dives)
  - [1. Debounced search (300ms)](#1-debounced-search-300ms)
  - [2. Search suggestion cache (Redux)](#2-search-suggestion-cache-redux)
  - [3. CORS: Vite proxy in dev, JSONP in prod](#3-cors-vite-proxy-in-dev-jsonp-in-prod)
  - [4. Video list — 50 items, one API call](#4-video-list--50-items-one-api-call)
  - [5. Live chat — polling + FIFO cap](#5-live-chat--polling--fifo-cap)
  - [6. Nested comments (recursive component)](#6-nested-comments-recursive-component)
  - [7. HOC — AdVideoCard](#7-hoc--advideocard)
  - [8. Redux Toolkit store](#8-redux-toolkit-store)
  - [9. Routing + sidebar toggle](#9-routing--sidebar-toggle)
- [Deployment (GitHub Pages)](#deployment-github-pages)
- [Known gaps / TODO](#known-gaps--todo)
- [Concept notes](#concept-notes)

---

## Run it

```bash
npm install
npm run dev       # vite dev server (search suggestions go through the dev proxy)
npm run build     # tsc -b && vite build  → typecheck then bundle
npm run lint      # eslint
npm run preview   # serve the production build locally
```

> **Note:** the YouTube Data API key is hardcoded in [src/utils/constant.tsx](src/utils/constant.tsx). Fine for a public-quota demo key, not fine for anything real — see [Known gaps](#known-gaps--todo).

---

## What's implemented

| Feature | Where | Technique |
|---|---|---|
| Debounced search input | [Head.tsx](src/component/Head.tsx) | `setTimeout` 300ms + `clearTimeout` in `useEffect` cleanup |
| Search suggestion cache | [cacheSlice.tsx](src/utils/cacheSlice.tsx) | Redux object keyed by query → `O(1)` lookup, no repeat API calls |
| CORS workaround | [suggestions.tsx](src/utils/suggestions.tsx) | Vite proxy in dev, JSONP `<script>` tag in prod |
| Trending video grid | [VideoContainer.tsx](src/component/VideoContainer.tsx) | One `fetch` on mount, `maxResults=50` |
| Live chat | [LiveChat.tsx](src/component/LiveChat.tsx) | Polling via `setInterval` (1000ms) + FIFO cap of 10 messages |
| Send your own message | [LiveChat.tsx](src/component/LiveChat.tsx) | Controlled form, prepends to the same list |
| Nested comments | [CommentsContainer.tsx](src/component/CommentsContainer.tsx) | Component recursion over a tree |
| HOC-style ad card | [VideoContainer.tsx](src/component/VideoContainer.tsx) | `AdVideoCard` wraps `VideoCard` |
| Sidebar toggle / auto-close | [appSlice.tsx](src/utils/appSlice.tsx) | Redux `toggleMenu` / `closeMenu` |
| Nested routing | [App.tsx](src/App.tsx) | `createBrowserRouter` + `<Outlet />` |
| Embedded player | [WatchPage.tsx](src/component/WatchPage.tsx) | `useSearchParams` → `?v=<id>` → iframe |
| Typecheck in CI + deploy | [.github/workflows/deploy.yml](.github/workflows/deploy.yml) | `npm run build` runs `tsc -b`, then Pages deploy |

---

## Architecture

```
main.tsx
└── App.tsx ──────────────── <Provider store>  (Redux)
    ├── <Head />             search bar, debounce, suggestions, menu toggle
    └── <RouterProvider>     basename = import.meta.env.BASE_URL
        └── "/" <Body />     flex row: Sidebar + <Outlet />
            ├── <Sidebar />           hidden when isMenuOpen === false
            ├── "/"      <MainContainer />
            │            ├── <ButtonList /> → <Button />   (chips)
            │            └── <VideoContainer />
            │                 └── <VideoCard /> × 50  (first one wrapped by AdVideoCard)
            └── "watch"  <WatchPage />        dispatches closeMenu() on mount
                         ├── iframe player
                         ├── <CommentsContainer /> → recursive <CommentsList /> → <Comments />
                         └── <LiveChat /> → <ChatMessage />
```

**Redux store shape**

```ts
{
  app:    { isMenuOpen: boolean },              // appSlice
  search: { [query: string]: string[] }         // cacheSlice
}
```

---

## File map

```
src/
├── App.tsx                      router + Provider + layout comment
├── main.tsx                     createRoot, StrictMode
├── component/
│   ├── Head.tsx                 🔑 debounce + cache read/write + suggestions dropdown
│   ├── Body.tsx                 Sidebar + <Outlet />
│   ├── Sidebar.tsx              reads isMenuOpen, returns null when closed
│   ├── MainContainer.tsx        ButtonList + VideoContainer
│   ├── ButtonList.tsx           static chip list
│   ├── Button.tsx               single chip
│   ├── VideoContainer.tsx       🔑 API fetch + HOC (AdVideoCard)
│   ├── VideoCard.tsx            thumbnail / title / channel / views
│   ├── WatchPage.tsx            iframe + comments + live chat
│   ├── LiveChat.tsx             🔑 polling + FIFO
│   ├── ChatMessage.tsx          one chat row
│   ├── CommentsContainer.tsx    🔑 recursion over nested comment tree
│   └── Comments.tsx             one comment row
└── utils/
    ├── store.tsx                configureStore + RootState type
    ├── appSlice.tsx             isMenuOpen: toggleMenu / closeMenu
    ├── cacheSlice.tsx           search suggestion cache
    ├── suggestions.tsx          🔑 proxy (dev) vs JSONP (prod), normalises both shapes
    └── constant.tsx             API URLs, API key, icons (user icon is inline base64)
```

---

## Feature deep dives

### 1. Debounced search (300ms)

Typing "iphone" would fire 6 API calls. Debouncing fires **one**, 300ms after you stop typing.

The trick is that `useEffect`'s cleanup runs *before* the next effect. Every keystroke changes `searchQuery` → React destroys the old effect (clearing the pending timer) → starts a fresh 300ms timer.

```tsx
// src/component/Head.tsx
useEffect(() => {
  const timer = setTimeout(() => getSearchSuggestion(), 300);
  return () => clearTimeout(timer);   // ← kills the previous timer
}, [searchQuery]);
```

Timeline for keystrokes 100ms apart:

```
key i ─ timer(300) ──x cancelled
key p   ─ timer(300) ──x cancelled
key h     ─ timer(300) ──x cancelled
key o       ─ timer(300) ──x cancelled
key n         ─ timer(300) ──x cancelled
key e           ─ timer(300) ──────────→ ✅ 1 API call
```

### 2. Search suggestion cache (Redux)

Before hitting the network, `Head` checks the Redux cache. A hit is an **object key lookup → O(1)**; array search would be O(n).

```tsx
if (searchCache[searchQuery]) {
  setSuggestions(searchCache[searchQuery]);   // cache hit, 0 API calls
} else {
  const s = await getSearchSuggestions(searchQuery.trim());
  setSuggestions(s);
  dispatch(cacheResult({ [searchQuery]: s })); // cache write
}
```

Shape:

```js
{ "ip": [...], "iph": [...], "iphone": [...] }
```

So backspacing from `iphone` → `iph` costs nothing.

> ⚠️ **This is currently an unbounded cache, not an LRU.** `cacheResult` just spreads the new key in, so entries are never evicted and the object grows for the whole session. Turning it into a real LRU (cap at N, evict least-recently-used) is on the [TODO](#known-gaps--todo) — see the [LRU note](#lru-cache) for what that means.

### 3. CORS: Vite proxy in dev, JSONP in prod

Google's suggest endpoint sends no `Access-Control-Allow-Origin` header, so the browser blocks a plain `fetch` from our origin. Two different escapes, picked at runtime by `import.meta.env.DEV`:

| | Transport | Why it works | Response shape |
|---|---|---|---|
| **Dev** | Vite server proxy (`/api/youtube-suggestions`) | The request leaves from the Vite server, not the browser — CORS never applies | `client=firefox` → `["hi", ["hindi song", ...]]` |
| **Prod** | JSONP `<script>` tag | `<script src>` is not subject to CORS; the response calls a global callback | `client=youtube` → `["hi", [["hindi song", 0, [512]], ...]]` |

GitHub Pages is static — there is no server to proxy through — hence JSONP in prod. Both shapes are normalised to `string[]` inside [suggestions.tsx](src/utils/suggestions.tsx), so callers never care which ran. The JSONP path also has a **5s timeout**, an `onerror` handler, and cleans up (deletes the global, removes the `<script>`) on every exit path.

### 4. Video list — 50 items, one API call

```
GET https://youtube.googleapis.com/youtube/v3/videos
    ?part=snippet,contentDetails,statistics
    &chart=mostPopular
    &maxResults=50          ← 50 is the API's hard max per page
    &regionCode=US
```

One `fetch` in a mount-only `useEffect` (`[]` deps). No pagination and no infinite scroll yet — 50 cards render at once. That's deliberate for now: it keeps quota use at 1 unit per load and avoids the complexity of a `nextPageToken` loop.

### 5. Live chat — polling + FIFO cap

Real YouTube live chat uses **polling**, not WebSocket, and it does not virtualise the list — it keeps a bounded window of recent messages and drops the oldest. Same idea here:

```tsx
// src/component/LiveChat.tsx
useEffect(() => {
  const t = setInterval(() => {
    setChats((p) => [makeFakeMessage(), ...p].slice(0, 10)); // newest first, keep 10
  }, 1000);
  return () => clearInterval(t);     // ← cleanup or you leak an interval per mount
}, []);
```

- **Polling interval:** 1000ms, generating a random name + message.
- **FIFO cap:** `.slice(0, 10)` — the 11th-oldest message is dropped, so the DOM never grows. This is why no virtual scrolling is needed.
- **Newest first + `flex-col-reverse`:** the list is stored newest-first and rendered reversed, so new messages appear at the bottom and it stays pinned there without scroll math.
- **Your own messages** go through the same list via the form's `onSubmit` (but are not capped away as aggressively since they're prepended like any other).

Why polling and not WebSocket here: the data is one-directional and slightly stale is fine. WebSocket earns its complexity when latency really matters (trading, 1:1 chat).

### 6. Nested comments (recursive component)

The comment tree is arbitrarily deep (`reply: CommentInfo[]`), so the renderer calls itself:

```tsx
export const CommentsList = ({ comments }: { comments: CommentInfo[] }) => {
  if (!comments?.length) return;                      // ← base case
  return comments.map((comment, i) => (
    <div key={i}>
      <Comments info={comment} />
      <div className="pl-6 ml-2 border-l-2">          {/* indent + thread line */}
        <CommentsList comments={comment.reply} />     {/* ← recursion */}
      </div>
    </div>
  ));
};
```

The mock data goes 6 levels deep (Ram → Mohit → lala → bala → mala → chacha) specifically to prove the indentation and the base case work.

### 7. HOC — AdVideoCard

> A HOC is a function that takes a component and returns a new, modified component.

`AdVideoCard` is the light version of that idea — a wrapper component that renders `VideoCard` plus a sponsored label, applied to the first item in the grid:

```tsx
{i === 0 ? <AdVideoCard info={video} /> : <VideoCard info={video} />}
```

### 8. Redux Toolkit store

Two slices, combined in [store.tsx](src/utils/store.tsx):

```tsx
const store = configureStore({
  reducer: { app: appReducers, search: cacheReduces },
});
export type RootState = ReturnType<typeof store.getState>;  // typed useSelector
```

| Slice | State | Actions |
|---|---|---|
| `appSlice` | `{ isMenuOpen: boolean }` | `toggleMenu()`, `closeMenu()` |
| `cacheSlice` | `Record<string, string[]>` | `cacheResult({ [query]: suggestions })` |

`RootState` is exported so `useSelector((state: RootState) => ...)` is fully typed. (`Sidebar.tsx` still declares its own local `AppState` interface — small inconsistency, listed in the TODO.)

### 9. Routing + sidebar toggle

- `createBrowserRouter` with a **nested** config: `Body` is the layout, `MainContainer` and `WatchPage` are children rendered into `<Outlet />`.
- `basename: import.meta.env.BASE_URL` → `/` in dev, `/viewTube/` on Pages, so routes work under the repo subpath.
- The hamburger dispatches `toggleMenu()`; `WatchPage` dispatches `closeMenu()` on mount so the player gets full width — matching real YouTube behaviour.
- Video links are `/watch?v=<id>`; `WatchPage` reads it with `useSearchParams()`.

---

## Deployment (GitHub Pages)

[.github/workflows/deploy.yml](.github/workflows/deploy.yml) runs on every push to `main`:

1. `npm ci`
2. `npm run build -- --base=/viewTube/` — note `build` is `tsc -b && vite build`, so **typecheck failures fail the deploy**
3. `cp dist/index.html dist/404.html` — the SPA fallback. Pages serves `404.html` for any path not on disk, so a deep link like `/watch?v=123` loads the app and the client router takes it from there.
4. `configure-pages` → `upload-pages-artifact` → `deploy-pages`

`concurrency: { group: pages, cancel-in-progress: true }` means a newer push cancels an in-flight deploy.

---

## Known gaps / TODO

- **Cache is not actually LRU** — unbounded object growth; add a size cap + eviction.
- **API key is committed** in `constant.tsx`. Should move to an env var (`import.meta.env.VITE_*`) and an HTTP-referrer-restricted key.
- **Search does nothing on submit** — suggestions render, but clicking one or pressing Enter doesn't run a search or navigate.
- **`onBlur` closes the dropdown before a click registers** — needs `onMouseDown` or a delay to make suggestions clickable.
- **Comments are hardcoded** — not fetched from the API.
- **Chips (`ButtonList`) are decorative** — no filtering wired up.
- **No pagination / infinite scroll** — capped at the first 50 videos.
- **`Sidebar.tsx` uses a local `AppState`** instead of the shared `RootState`.
- **No loading or error state** in `VideoContainer` — a failed fetch renders an empty grid silently.

---

## Concept notes

Reference notes collected while building this.

### When do you actually need `useEffect`?

**YES — probably needs `useEffect`** (syncing with something outside React):

`API` · `WebSocket` · `DOM` · `localStorage` · `timer` · `event listener` · `third-party library` · `subscription`

**NO — you don't need it** (this is just rendering):

Calculating something · handling a button click · updating state from a user action · creating a function · transforming data · filtering an array · deriving a value

Every `useEffect` in this project is in the "YES" column: a timer (debounce), a timer (chat polling), an API call (videos), and a dispatch on mount (`closeMenu`) — and each one that starts something returns a cleanup that stops it.

### State update patterns

```jsx
// Array → add
setItems((prev) => [...prev, newItem]);

// Array → remove
setItems((prev) => prev.filter((item) => item.id !== id));

// Array → update
setItems((prev) =>
  prev.map((item) => (item.id === id ? { ...item, name: "Updated" } : item)),
);

// Object → add/update property
setUser((prev) => ({ ...prev, name: "Updated" }));

// Number → increment
setCount((prev) => prev + 1);
```

Always the updater form (`prev => ...`) when the next value depends on the previous one — `LiveChat` relies on this because the interval closure would otherwise capture a stale `chats`.

### `useCallback` vs `useMemo`

```jsx
// useCallback → memoises a FUNCTION
const handleSelect = useCallback((user) => setSelected(user), []);

// useMemo → memoises a VALUE
const filteredUsers = useMemo(
  () => users.filter((u) => u.name.toLowerCase().includes(text.toLowerCase())),
  [users, text],
);
```

### Lookup cost

| Structure | Search |
|---|---|
| Array | `O(n)` |
| Object | `O(1)` |
| `Map` | `O(1)`, and more optimised for frequent add/delete |

This is why the suggestion cache is keyed by query string instead of being an array of `{query, results}`.

### LRU cache

**LRU = Least Recently Used.** Keep only the latest N entries (e.g. 100–150) and evict the one used longest ago. Bounds memory while keeping the hits you're most likely to need.

**FIFO** is the simpler cousin: evict the oldest inserted, regardless of use. The live chat's `.slice(0, 10)` is FIFO.

### Polling vs WebSocket

| | Use it for | Example |
|---|---|---|
| **WebSocket** | Low latency, bidirectional | Trading app, 1:1 live chat |
| **Polling** | Periodic refresh is good enough | Gmail, Cricinfo, YouTube comments |

YouTube's own live chat polls (roughly every ~123ms at peak), uses **no virtual scroll**, and keeps only a couple hundred messages (~238), deleting the oldest — FIFO. `LiveChat.tsx` is the same design at a slower interval and a smaller cap.

### HOC

> A HOC is a function that takes a component and returns a new component — it takes an existing component and returns a modified one.

---

Setup / scaffolding steps: [SETUP.md](SETUP.md)

# Design: loading-feedback

## Baseline (before this spec)
Measured with `scripts/measure-nav.mjs` (headless Chrome over CDP, 1280px)
against Neon us-east-2. Round 2 (warm):

| transition | dev route / ready | prod route / ready |
|---|---|---|
| login -> /workflows | 485 / 1205 ms | stuck on /login |
| /workflows -> editor | 518 / 1271 | 85 / 688 |
| /workflows -> run (Simulate push) | 1696 / 4656 | 1940 / 3008 |
| run -> report | 329 / 1603 | 115 / 711 |

`scripts/measure-api.mjs`, prod: `GET /api/workflows` 673 ms,
`GET /api/workflows/[id]` 652 ms, `POST /api/runs` 1152 ms, while one
Neon round trip is about 270 ms.

Causes found:
1. **Login stuck in production.** The login page links to `/workflows`
   (LandingHeader). In production Next prefetches it while logged out, the
   middleware answers with a redirect to `/login`, and the router caches
   that. `router.replace('/workflows')` after login replays the cached
   redirect.
2. **Two round trips per query.** postgres-js with `prepare: false` sends a
   describe before every parameterised query. Neon's PgBouncer supports
   protocol-level prepared statements (Neon changelog 2024-02-09), so
   `prepare: true` is safe and halves query time.
3. **Sequential queries.** `listWorkflows` waits for workflows, then the
   last runs, then status writes, one after another.
4. **Refetch after Simulate push.** The run view loads the run that
   `POST /api/runs` just returned.
5. **No loading boundary.** `/workflows/[id]` and `/runs/[id]` are dynamic,
   so Link prefetch has nothing to prefetch and a click waits for the
   server render before anything changes.

Pages do not await the database before the first paint: page components
render client components that load through `/api`.

## Components
```
components/ui/Skeleton.tsx       <Skeleton/> block + <SkeletonPage label> wrapper
components/ui/Spinner.tsx        14px ring; static dot under reduced motion
components/ui/Button.tsx         + pending, pendingLabel (aria-busy, spinner)
components/ui/SlowNotice.tsx     slow/error message with Retry (role=status / alert)
components/app/NavigationProgress.tsx   bar + sr-only status + slow notice
lib/navigation.ts                start/done store, useNavigate()
lib/useSlow.ts                   true after 8 s while active
components/skeletons/*.tsx       WorkflowsSkeleton, EditorSkeleton, RunSkeleton, ReportSkeleton
```

### Progress bar
- A tiny store in `lib/navigation.ts` (`start(href)`, `done()`,
  `subscribe`). `NavigationProgress` (root layout, client) listens to
  document clicks in the capture phase and calls `start` for qualifying
  links. `useNavigate()` wraps `router.push/replace` and calls `start`.
- `done()` runs in an effect when `usePathname()` or `useSearchParams()`
  change (wrapped in Suspense for static pages), plus a 15 s safety stop
  that leaves the slow notice visible.
- Bar: fixed, 3px, `--accent`, `transform: scaleX()`. Starts at 0.1, eases
  to 0.8 over a few seconds, jumps to 1 and fades on done. No gradient, no
  glow. Reduced motion: no transition, fixed at 0.8 until done.
- Slow (8 s): notice under the top bar; Retry does a full load of the
  target URL.

### Pending and slow in hooks
- `useQuery` adds `retry()`. Skeleton while loading; after 8 s the
  SlowNotice with Retry; on error a message with Retry.
- `useAction` adds `slow`, `retry()` (runs again with the last
  arguments) and an `onSuccess` option that only runs for the latest
  attempt, so a retried Simulate push does not navigate twice.
- Retrying a pending Simulate push can start a second run if the first
  request does reach the server. Acceptable for demo data; noted here.

### Login
Credentials are checked in the browser. On submit: "Signing in as demo…",
set the cookie, then "Loading your workspace…" and a full navigation
(`window.location.assign`). The full load fixes cause 1 and swaps the
landing shell for the app shell anyway. The status line stays until the
new page replaces it; after 8 s SlowNotice offers Retry.

### Speed fixes
- `prepare: true` in `db/client.ts`.
- `listWorkflows`: workflows and last runs in parallel. Status sync in one
  `UPDATE ... FROM (VALUES ...)` statement.
- `apiSource` keeps the run from `runs.start` (and the workflow from
  `workflows.create`) and serves the next `get` of that id from memory once.
- `loading.tsx` on the four routes gives Link prefetch a boundary, so the
  skeleton appears on click.

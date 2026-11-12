# Design: app-pages

## Route tree (apps/web/app)
```
page.tsx                       /                 landing (public)
login/page.tsx                 /login            public, landing top bar
editor/page.tsx                /editor           redirect -> /workflows/<demo id>
(app)/layout.tsx               logged-in shell: AppTopBar + SideNav
(app)/workflows/page.tsx       /workflows
(app)/workflows/[id]/page.tsx  /workflows/[id]   editor
(app)/runs/page.tsx            /runs             P2 placeholder
(app)/runs/[id]/page.tsx       /runs/[id]        live run
(app)/runs/[id]/report/page.tsx
(app)/runners/page.tsx         /runners
(app)/settings/page.tsx        /settings         redirect -> /settings/github
(app)/settings/github/page.tsx
(app)/templates/page.tsx       /templates        P2 placeholder
middleware.ts                  auth guard
```
`(app)` is a route group, so it adds no URL segment. Old `workflow/...`,
`api/` and `db/` are untouched.

## Auth (demo)
- `lib/auth/demo.ts`: `DEMO_ACCOUNT = { email: 'demo@flowpilot.dev',
  password: 'kiroween-demo' }` (public test credentials, shown on the
  login page), `SESSION_COOKIE = 'fp_session'`, `safeNext(value)`.
- Login checks credentials in the browser, sets
  `fp_session=demo; Path=/; SameSite=Lax; Max-Age=7 days` and navigates.
- `middleware.ts` matcher: `/workflows/:path*`, `/runs/:path*`,
  `/runners/:path*`, `/settings/:path*`, `/templates/:path*`, `/login`.
  Missing cookie on a protected path redirects to `/login?next=<path>`;
  cookie present on `/login` redirects to `/workflows`.
- `safeNext` accepts only values matching `^/(?!/)` with no backslash, to
  prevent open redirects.
- Clearly a demo: the cookie is not signed and grants nothing server-side
  (all data is mocked in the browser). Real auth replaces this module.

## Data layer (lib/data)
```
types.ts     Workflow, WorkflowGraph, GraphNode, GraphEdge, NodeKind config,
             Run, RunStatus, RunEvent, Runner, GithubSettings
source.ts    interface DataSource { workflows, runs, runners, github }
mock/        storage.ts (versioned localStorage JSON), seed.ts,
             workflows.ts, runs.ts, runners.ts, github.ts, index.ts
index.ts     export const data: DataSource = mockSource
useData.ts   React hooks over the source (subscribe + snapshot)
```
- All methods are async (`Promise`) so an HTTP adapter fits without
  changing callers.
- The mock emits a change signal; `useSyncExternalStore`-based hooks
  re-read. No new dependencies.
- Storage key `flowpilot:v1`. Corrupt or missing data falls back to seed.
- Graph types mirror `shared` `WorkflowData`: `GraphNode { id, type:
  NodeType, position, config, title? }`. Conversion to React Flow nodes
  lives in `lib/workflow/graph.ts`. Save validates with `validateWorkflow`
  and `getConfigSchema(type).safeParse(config)`.
- New node and edge ids use `crypto.randomUUID()`, so saved graphs also
  pass `workflowDataSchema` for the real API later. The demo workflow uses
  the seed id `450e8400-e29b-41d4-a716-446655440000`.

## Node kinds
`NodeKind` adds `fork`. Mapping to shared `NodeType`:
spark→Spark, brain→Brain, scalpel→Scalpel, heart→Heart, fork→Fork,
lever→Lightning Lever, autopsy→Autopsy Report. Fork has source handles
`passed` and `failed` (labels shown next to the handles). Eyes is not
offered in the picker (not requested).

## Mock run engine (lib/run)
- `reduceRun(graph, events) -> RunView` is pure: per-node status, per-edge
  state (idle/active/done), log lines, run status, decision, findings.
- Mock timeline (`mockTimeline(graph)`): walk the graph from Spark in
  topological order. Per kind:
  - spark: ok, log "push to main, 3 files changed"
  - brain: running then ok, AI log lines for tool calls and 2 findings
  - scalpel: fail, "src/cart.ts:12 no-unused-vars" (1 error)
  - heart: fail, "cart.test.ts: applies discount" (11 passed, 1 failed)
  - fork: routes to `failed` when any upstream check failed
  - lever: wait (run status awaiting_approval) and stop the timeline
  - autopsy: ok after a decision
  Parallel branches start at the same offset.
- Run record stored by the data layer: `{ id, workflowId, startedAt,
  graph snapshot, events }`. Events have an `at` offset in ms. The view
  ticks every 250 ms and feeds events with `at <= elapsed` to the reducer.
  This makes the run survive navigation and reloads.
- Approve/Reject append a `decision` event at the current offset plus
  follow-up events (lever ok/fail, autopsy running then ok, run
  succeeded or failed). Approve: run status succeeded. Reject: failed.
- Swapping in SSE: the stream delivers the same `RunEvent` objects.

## Layout
- `(app)/layout.tsx`: grid `topbar / nav + content`. Nav 200px, 28px
  rounded `--surface` panel. Content area scrolls; editor and run pages
  use full height.
- Under 820px: nav becomes a horizontal scrollable pill row under the top
  bar; editor inspector moves below the canvas.
- `PageHeader` (h1 + optional actions) used by every logged-in page. One
  h1 per page.

## Components (new or moved)
```
components/app/AppTopBar.tsx, SideNav.tsx, UserMenu.tsx, PageHeader.tsx
components/ui/TextField.tsx, Switch.tsx, CopyButton.tsx, StatusBadge.tsx,
  EmptyState.tsx, Card.module.css
components/flow/StitchEdge.tsx         idle | active | done
components/flow/NodePicker.tsx
components/run/LogPanel (reuse shell/LogPanel), ApprovalBar.tsx,
  RunCanvas.tsx, ReportCard.tsx
components/editor/WorkflowEditor.tsx, NodeInspector.tsx, SaveErrors.tsx
```
`components/editor/Editor.tsx` and `shell/AppShell.tsx` / `TopBar.tsx` /
`TabPills.tsx` were removed in task 4 (nothing else imported them;
recoverable from git). `shell/Inspector` and `shell/LogPanel` are reused.

Editor notes (task 4):
- `lib/workflow/graph.ts` maps stored nodes to React Flow nodes
  (`EditorNode`, data = display fields + `type` + `config` + `customTitle`).
- `lib/workflow/validate.ts` combines `validateWorkflow` with per-type Zod
  config checks and plain field messages.
- Connecting also works without a pointer: the inspector has "Connect to"
  (and "Branch" for Fork), because React Flow handles are drag-only.
- `FitOnResize` refits only when the pane size changes, so adding a node
  does not move the view.
- One Spark per workflow: the picker disables Spark when one exists.

## Status text
- Node: Idle, Running, Passed, Failed, Waiting.
- Run: Queued, Running, Awaiting approval, Succeeded, Failed, Cancelled,
  Timed out. Colors: running accent, succeeded ok, failed/timed out bad,
  awaiting wait, queued/cancelled muted.
- Runner: Online (ok), Offline (muted).

## Copy button
`navigator.clipboard.writeText`; on success the label changes to "Copied"
for 2 s and a polite live region announces it. On failure the label says
"Copy failed, select the text" and the value stays selectable.

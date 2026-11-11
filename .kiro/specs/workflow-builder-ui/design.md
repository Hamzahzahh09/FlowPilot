# Design: workflow-builder-ui

## Routing
`app/page.tsx` (root `/`) renders the new editor. The old landing page is
replaced; its content is recoverable from commit `b92b6aa`. The old
`/workflow/...` routes stay in place and are not restyled in this spec.

## File layout (apps/web)
```
app/
  layout.tsx            fonts (next/font/google), globals.css
  globals.css           tokens, base styles, React Flow overrides
  page.tsx              renders <Editor />
components/
  icons.tsx             inline SVG icon set
  editor/Editor.tsx     client entry: wires store, shell, canvas
  shell/AppShell.tsx    grid layout (top bar, canvas card, log, inspector)
  shell/TopBar.tsx      logo, name, tab pills, Simulate push, Reset
  shell/TabPills.tsx    workflow switcher
  shell/LogPanel.tsx    log list, header slot for ApprovalBar
  shell/Inspector.tsx   selected node details
  flow/FlowNode.tsx     custom React Flow node
  flow/Canvas.tsx       ReactFlow + Background
  *.module.css          per-component styles using tokens only
lib/workflow/
  types.ts              NodeKind, NodeStatus, FlowNodeData, status labels
  demo.ts               demo nodes, edges, seed run data
lib/run/                (task 6) typed run store + mock runner
```

## Styling
- Tokens in `:root` of `globals.css`; light values under
  `@media (prefers-color-scheme: light)` with the same names.
- Extra token beyond design.md: `--on-accent` (text on accent background),
  dark `#1f1f21`, light `#ffffff`. Needed because the light accent is darker
  for contrast. Status ring width is a token `--ring: 2px`.
- Light theme values: bg `#f4f4f5`, surface `#ffffff`, node `#ececee`,
  node-hover `#e3e3e6`, dot `#c9c9cf`, edge `#9a9aa3`, text `#1f1f21`,
  muted `#5f5f68`, accent `#b8325a`, ok `#1f7a4a`, bad `#c0392b`,
  wait `#8a6100`. All text colors are at least 4.5:1 on surface.
- React Flow `base.css` is imported (not `style.css`) so React Flow adds no
  look of its own.
- Component styles use CSS modules. No Tailwind (not installed).
- Fonts: `Inter` as `--font-inter`, `JetBrains Mono` as `--font-jetbrains`
  on `<html>`; `--font-sans` and `--font-mono` wrap them with system
  fallbacks.

## Layout
```
.shell   grid rows: topbar | main | log        height 100dvh, padding 12px
.main    grid cols: canvas card | inspector 300px
<820px   inspector display:none, single column
<640px   canvas card scrolls horizontally; inner min-width 960px
```

## Node model
```ts
type NodeKind = 'spark' | 'brain' | 'scalpel' | 'heart' | 'lever' | 'autopsy'
type NodeStatus = 'idle' | 'running' | 'ok' | 'fail' | 'wait'
interface FlowNodeData { kind: NodeKind; title: string; themeName: string; operation: string; status: NodeStatus }
```
Label line 1 is `title` (plain English, e.g. "AI code review"); line 2 is
`themeName · operation` in `--muted` (e.g. "Brain · analyze diff").
Spark has no input handle; Autopsy has no output handle.
`STATUS_LABEL` maps status to Idle, Running, Passed, Failed, Waiting.

FlowNode renders the 80x80 box as the measured node; the label is absolutely
positioned below it so handles center on the box. Status ring is
`box-shadow: 0 0 0 var(--ring) <status color>` on the box. The React Flow
wrapper gets `ariaLabel` "<title>, <operation>, status <label>" and the
focus ring is drawn on the box via `.react-flow__node:focus-visible`.

Status text: design.md asks for a visually hidden status text. The hard rule
"never color alone" also applies to sighted users, so non-idle statuses are
also shown as a short visible line under the label in the status color.

## Demo workflow layout
x positions 0, 200, 400 (Scalpel y -90, Heart y +90), 600, 800, y 0.
Edges: spark-brain, brain-scalpel, brain-heart, scalpel-lever, heart-lever,
lever-autopsy.

## Edges (task 5)
Custom edge `StitchEdge` using `getBezierPath`, with `data.state`
'idle' | 'active' | 'done' mapped to CSS classes. Dash animation through
`stroke-dashoffset` keyframes, disabled under reduced motion.

## Run store (task 6)
A small external store (`useSyncExternalStore`, no new dependency) holding
`{ phase, nodeStatus: Record<id, NodeStatus>, edgeState, log, decision }`.
Actions: `start`, `reset`, `approve`, `reject`, plus `applyEvent(event)` so
the mock timer and a future SSE stream feed the same reducer.

## Accessibility
- Visible `:focus-visible` ring (2px `--accent`, offset 2px) on every
  interactive element.
- `prefers-reduced-motion: reduce` disables edge flow and pulse animations.

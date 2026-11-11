# Requirements: workflow-builder-ui

Source of truth for look and behavior: `.kiro/steering/design.md`.
Product concept: `docs/technical/spec-workflow-builder.md`,
`docs/technical/design-workflow-builder.md`, `.kiro/steering/product.md`.
Where product.md or the older docs disagree with design.md on visuals
(colors, radii, icons), design.md wins.

## Scope
A front-end only workflow editor for the demo workflow, with a mocked run.
No backend calls, no real AI, no new dependencies. The existing
`/workflow/...` routes, `app/api/` and `db/` stay untouched.

## User stories and acceptance criteria

### R1. Design tokens
As a developer I want one set of tokens so every component looks consistent.
1. WHEN the app loads THEN `:root` SHALL define the design.md tokens
   (`--bg`, `--surface`, `--node`, `--node-hover`, `--dot`, `--edge`, `--text`,
   `--muted`, `--accent`, `--ok`, `--bad`, `--wait`), radius tokens
   (container 28px, node 16px, pill 999px, input 12px), and `--font-sans`,
   `--font-mono`.
2. WHEN the user prefers a light color scheme THEN the same token names SHALL
   resolve to light values with WCAG AA text contrast.
3. Fonts SHALL load through `next/font/google`: Inter (UI) and JetBrains Mono
   (mono), because Geist is not in the Next 14.2.35 font list. Both fall back
   to system fonts.
4. No gradients, glows, or card drop shadows anywhere.

### R2. AppShell
1. The shell SHALL show a top bar with logo, workflow name, workflow tab
   pills, a Simulate push button and a Reset button.
2. The canvas SHALL sit in a card with 28px radius.
3. A log panel SHALL sit below the canvas.
4. An inspector panel SHALL sit right of the canvas and SHALL be hidden below
   820px viewport width.
5. At 390px width the layout SHALL not overflow the page; the canvas scrolls
   horizontally inside its card.
6. Tab pills: mono 13px, radius 999px; the selected pill uses `--accent`
   background with dark text.

### R3. FlowNode
1. Each node SHALL render an 80x80 rounded square (16px radius) containing
   only an inline SVG icon (24px grid, 1.75 stroke, round caps and joins).
2. A label SHALL sit below the box, centered, mono 11px: line 1 title,
   line 2 operation in `--muted` (for example "Brain · analyze diff").
3. Handles SHALL be 10px dots in `--edge`.
4. Node status (idle, running, ok, fail, wait) SHALL show as a 2px ring in
   the status color AND as text (Idle, Running, Passed, Failed, Waiting).
   Idle text is visually hidden; other statuses are visible under the label,
   so status never relies on color alone.
5. Nodes SHALL be keyboard focusable with a visible focus ring and an
   accessible name that includes title and status.

### R4. Canvas and demo workflow
1. The canvas SHALL use React Flow Background, variant Dots, gap 22, size 1.6,
   color `--dot`.
2. The demo workflow SHALL be: Spark (On push) -> Brain (AI code review) ->
   Scalpel (Run lint) and Heart (Run tests) in parallel -> Lightning Lever
   (Human approval) -> Autopsy (Report).
3. React Flow attribution SHALL be hidden (`proOptions.hideAttribution`;
   React Flow is MIT licensed).

### R5. Edges
1. Edges SHALL be bezier, 2px, `--edge`.
2. An active edge SHALL be `--accent`, dashed 6/8, with an animated dash
   offset. A finished edge SHALL be solid `--muted`.
3. WHEN reduced motion is preferred THEN the dash animation SHALL be off.

### R6. Mocked run
1. Run state SHALL live in one typed store: per-node status plus run phase,
   log lines and the approval decision, so an SSE stream can drive it later.
2. Simulate push SHALL step through the workflow on timers. Seed data SHALL
   produce one lint error and one failing test.
3. The run SHALL pause at Lightning Lever until Approve or Reject.
4. Reset SHALL return everything to idle and cancel pending timers.

### R7. LogPanel and ApprovalBar
1. Log lines SHALL use mono 12.5px with a `--muted` timestamp column and
   `aria-live="polite"`. Colors: AI `--accent`, pass `--ok`, fail `--bad`,
   waiting `--wait`; each line also carries a text tag.
2. WHEN the run is waiting THEN the ApprovalBar SHALL appear in the log panel
   header with Approve and Reject buttons of equal size and weight.
3. The waiting node SHALL breathe with a soft ring pulse (off with reduced
   motion).

### R8. Inspector and ReportCard
1. The inspector SHALL show the selected node's title, operation, status and
   step details.
2. WHEN the run ends (Approve or Reject) THEN a ReportCard (Autopsy Report)
   SHALL show decision, AI findings, lint result, test result and a per-step
   status list.

### R9. Quality gates
1. After every task, `tsc --noEmit` in `apps/web` and root `pnpm lint` SHALL
   pass. No `any`.
2. Every interactive element has a visible keyboard focus ring.
3. No emoji, no ALL-CAPS eyebrow labels, no numbered section markers.

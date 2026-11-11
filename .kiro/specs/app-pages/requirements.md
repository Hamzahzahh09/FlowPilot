# Requirements: app-pages

Visual source of truth: `.kiro/steering/design.md`. Product concept:
`docs/technical/spec-workflow-builder.md`, `design-workflow-builder.md`.
Run statuses follow `.kiro/steering/tech.md`.

## 1. Inventory (as of commit 1c94740, read-only)

### Pages (apps/web/app)
| Path | File | What it is |
|---|---|---|
| `/` | `page.tsx` | New landing (landing-page spec, tasks 1-2 done) |
| `/editor` | `editor/page.tsx` | New editor shell with demo canvas (workflow-builder-ui tasks 1-4) |
| `/workflow/new` | `workflow/new/page.tsx` | Old editor, blank workflow |
| `/workflow/[id]/edit` | `workflow/[id]/edit/page.tsx` | Old editor; loads from DB, falls back to `SAMPLE_WORKFLOW` |

Old editor components in `workflow/[id]/edit/components/`: `WorkflowCanvas`,
`NodePalette`, `ConfigPanel`, `ValidationModal`, `nodeInfo.ts`,
`sampleWorkflow.ts`, `nodes/CustomNode.tsx`, `edges/StitchEdge.tsx`.
They use the old lab palette and emoji.

### API routes (apps/web/app/api)
| Route | Methods | Behavior |
|---|---|---|
| `/api/workflows` | GET, POST | List (fallback demo item when no DB); create/upsert with `workflowDataSchema` |
| `/api/workflows/[id]` | GET, POST | Load (returns `{id, status}` stub when no DB); upsert |

### DB (apps/web/db, Drizzle)
| Table | Columns |
|---|---|
| `workflows` | `id uuid pk`, `name`, `description`, `data jsonb {nodes, edges}`, `created_at`, `updated_at` |

`db/client.ts` returns `null` without `DATABASE_URL`. `db/seed.ts` inserts
"Automated Code Review" with id `450e8400-e29b-41d4-a716-446655440000`.
No tables exist for runs, runners, users or GitHub settings.

### Shared (packages/shared)
`workflowDataSchema` (uuid node and edge ids), per-type config schemas,
`getDefaultConfig`, `ALLOWED_COMMANDS`, `validateWorkflow` (structure rules).

### Mapping to the new route structure
| Existing | New | Decision |
|---|---|---|
| `/` landing | `/` | Kept (landing-page spec). Logged-out top bar. |
| `/editor` | `/workflows/[id]` | Editor moves; `/editor` redirects to `/workflows/<demo id>`. Components reused: `Canvas`, `FlowNode`, `FitOnResize`, `LogPanel`, `Inspector`, `Button`. |
| `/workflow/[id]/edit` | `/workflows/[id]` | Old page stays untouched. Its features (palette, config panel, save validation) are rebuilt in the new editor with design.md tokens. Logic reused from `shared`: `validateWorkflow`, `getConfigSchema`, `getDefaultConfig`, `ALLOWED_COMMANDS`. Old components are not imported (emoji, old palette). |
| `/workflow/new` | `/workflows` "New workflow" | Old page stays untouched. New workflows are created from `/workflows`. |
| `/api/workflows*` | data layer `workflows` | Kept untouched. Not called yet: without a DB the `[id]` GET returns a stub, so the data layer uses the mock source. An HTTP adapter can target these routes later. |
| `db/schema.ts` `workflows` | data layer types | `Workflow` mirrors the table (`id`, `name`, `description`, `data`, timestamps). Demo workflow uses the seed id. |

The old `/workflow/...` pages are not restyled in this spec; they are
cleaned up after the new pages work (agreed earlier).

## 2. Routes

### P0
- **R1 `/`**: landing, unchanged except links (task 10).
- **R2 `/login`**
  1. Email and password form, labels above inputs, 12px input radius.
  2. "Demo account" box shows the test email and password, and a
     "Use demo account" button fills the form.
  3. Wrong credentials show an inline error tied to the form (`role="alert"`).
  4. On success go to `/workflows`, or to the `next` query value when it
     is a same-site path starting with a single `/`.
- **R3 `/workflows`**
  1. Cards (16px radius): name, trigger, last run status (text label plus
     color), updated time.
  2. Seeded "Automated code review" card with "Open" and "Simulate push".
     Simulate push starts a run and goes to `/runs/[id]`.
  3. "New workflow" creates a workflow with a Spark and an Autopsy node and
     opens it.
  4. Empty state explains what to do and offers "New workflow".
- **R4 `/workflows/[id]`** editor
  1. Node picker with Spark, Brain, Scalpel, Heart, Fork, Lightning Lever,
     Autopsy. Activating an item adds the node (keyboard and pointer).
  2. Connect by dragging handle to handle; drag nodes; delete selected
     node or edge with Delete/Backspace or an inspector "Delete" button.
  3. Fork has two outputs, "Passed" and "Failed".
  4. Inspector edits the selected node: title, and config per type
     (Brain prompt and max steps, Scalpel/Heart command from
     `ALLOWED_COMMANDS`, Spark trigger, Autopsy format). Validated with
     the shared Zod schemas; errors shown next to the field.
  5. Save runs `validateWorkflow`; errors are listed in a panel with
     `role="alert"`; a valid workflow is stored and "Saved" is announced.
     Unsaved changes are indicated.
  6. Simulate push saves first, then starts a run and opens `/runs/[id]`.
  7. Unknown id shows a not-found state with a link to `/workflows`.
- **R5 `/runs/[id]`** live run
  1. Read-only canvas with node status rings plus text labels, edge
     states idle/active/done (accent dashed animated, solid muted).
  2. Log panel, mono 12.5px, timestamp column, `aria-live="polite"`,
     each line has a text tag (AI, Pass, Fail, Wait, Info).
  3. When the run awaits approval, the ApprovalBar shows in the log header:
     Approve and Reject with equal size and weight. Waiting node breathes
     (off under reduced motion).
  4. Run status badge (Queued, Running, Awaiting approval, Succeeded,
     Failed, Cancelled, Timed out) with text.
  5. When finished, a link "View report" goes to `/runs/[id]/report`.
  6. The mocked run produces one lint error and one failing test.
- **R6 `/runs/[id]/report`** Autopsy Report
  1. Decision (Approved or Rejected), AI findings, lint result, test
     result, per-step status list, run metadata, link back to the workflow.
  2. If the run has not finished, say so and link to the live view.

### P1 (real layout, mocked data)
- **R7 `/runners`**
  1. Runner list with Online/Offline as text plus color, last seen time.
  2. "Create runner token" shows the new token once with a Copy button
     and a note that it is shown only once. Token comes from the mock.
  3. Setup guide: install, paste token, run in the project folder (code
     blocks, each with Copy).
- **R8 `/settings/github`**
  1. Repository field and "Connect repository" (mock), connected state.
  2. Webhook URL, read-only, with Copy.
  3. Webhook secret masked by default, with Show/Hide and Copy.
  4. Toggles (switch role) for push and pull request triggers.

### P2
- **R9 `/runs`** and **`/templates`**: page title plus a "Coming later"
  empty state that says what the page will do and links to `/workflows`.

## 3. Shared layout
- **R10** Logged-in pages: top bar (logo to `/workflows`, page or workflow
  title, user menu with email and "Sign out"), and a left nav (Workflows,
  Runs, Runners, Settings) as a 28px rounded panel. Current item has
  `aria-current="page"`. Under 820px the nav becomes a horizontal menu
  under the top bar.
- **R11** Logged-out pages (`/`, `/login`) use the landing top bar.
- **R12** Auth guard: logged-in routes redirect to `/login?next=<path>`
  without a session. `/login` with a session goes to `/workflows`.
  This is a demo guard with a static account, not real security.

## 4. Data layer
- **R13** One typed interface `DataSource` for workflows, runs, runners and
  GitHub settings. Pages use only this interface. A mock implementation
  (browser storage) backs it now; it can be swapped for an HTTP adapter.
- **R14** Run state is derived by one pure reducer from an ordered list of
  run events, so a future SSE stream can feed the same reducer.

## 5. Quality
- **R15** design.md tokens only, flat, one accent, no emoji, status with text.
- **R16** Visible focus rings, AA contrast in both themes, reduced motion
  respected, works at 1280px and 390px without page-level horizontal scroll.
- **R17** `tsc --noEmit` (apps/web) and root `pnpm lint` pass after each task.

## 6. Relation to other specs
- workflow-builder-ui tasks 5-8 (edges, run store, log/approval,
  inspector/report) are delivered by app-pages tasks 4-6.
- landing-page tasks 3-5 (How it works, Three parts, footer, a11y pass)
  are still open and not part of this spec.

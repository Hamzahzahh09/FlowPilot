# Design: neon-data-layer

## Layers
```
components/*            unchanged, call `data.*`
lib/data/index.ts       data = NEXT_PUBLIC_DATA_SOURCE === 'mock' ? mockSource : apiSource
lib/data/api.ts         apiSource: fetch('/api/...'), emits change after mutations
app/api/**/route.ts     thin handlers: parse with shared Zod schema, call server/*
server/*.ts             Drizzle queries and business rules (server only)
db/schema.ts            tables and enum
packages/shared/api.ts  request schemas + workflowGraphSchema
```

## Tables (db/schema.ts)
| table | columns |
|---|---|
| workflows | id uuid pk, name, description, data jsonb (graph), created_at, updated_at |
| runs | id uuid pk, workflow_id fk -> workflows (cascade), workflow_name, trigger, status run_status, graph jsonb, events jsonb, decision, decided_at, started_at, updated_at; index (workflow_id, started_at) |
| runners | id uuid pk, name, status, token_hash unique, token_preview, last_seen_at, created_at |
| github_settings | id int pk = 1 (single row), repository, connected_at, webhook_secret, trigger_push, trigger_pull_request |

Events stay a JSONB array on `runs`, because the mock timeline rebuilds the
whole list on a decision. A `run_events` table comes with the real runner
and SSE, where events arrive one by one.

`runs.status` is the stored status. The mock timeline derives status from
time, so `server/runs.ts` recomputes it with `runStatusAt` on read and
writes it back when it changed. Queries filtering by status stay correct
for any run that was read at least once.

## Routes
| method | path | body schema |
|---|---|---|
| GET/POST | /api/workflows | workflowCreateInputSchema |
| GET/PUT | /api/workflows/[id] | workflowSaveInputSchema |
| GET/POST | /api/runs | runStartInputSchema |
| GET | /api/runs/[id] | |
| POST | /api/runs/[id]/decision | runDecisionInputSchema |
| GET/POST | /api/runners | runnerCreateInputSchema |
| GET/PATCH | /api/settings/github | githubSettingsPatchSchema |

Errors: `{ error: string, details?: string[] }` with 400, 401, 404, 409
(run not awaiting approval), 500, 503 (no DATABASE_URL).

## Shared schemas (packages/shared/src/api.ts)
- `workflowGraphSchema`: nodes (max 100) and edges (max 200). Node config is
  checked with `getConfigSchema(type)`, because the existing
  `nodeConfigSchema` union matches `{}` first and would strip Scalpel and
  Heart commands. Optional node `title` (max 60) is kept.
- `superRefine` adds `validateWorkflow` errors.

## Client adapter
- `apiSource.subscribe` keeps a local listener set; every mutation emits, so
  `useQuery` reloads like it did with the mock. No polling: the run view
  already replays events on a timer from `startedAt`.
- Response parsing: JSON typed by the route; errors throw `Error(message)`.

## Old editor
- Delete `app/workflow/[id]/edit/components/*` and `app/workflow/new`.
- `app/workflow/page.tsx` -> redirect `/workflows`;
  `app/workflow/[id]/edit/page.tsx` -> redirect `/workflows/[id]`.
- `/editor` keeps its redirect, importing the demo id from `lib/data`.

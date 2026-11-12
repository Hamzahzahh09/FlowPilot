# Requirements: neon-data-layer

Move the app data from browser storage (`lib/data/mock`) to Neon Postgres,
so the hosted demo keeps workflows, runs, runners and GitHub settings
between browsers and devices.

## R1 Real data source
- The logged-in pages (`/workflows`, `/workflows/[id]`, `/runs/[id]`,
  `/runs/[id]/report`, `/runners`, `/settings/github`) read and write through
  `/api/*`, backed by Neon via Drizzle.
- Pages keep using the `DataSource` interface; no page code changes.
- The browser mock stays available with `NEXT_PUBLIC_DATA_SOURCE=mock` for
  offline work.

## R2 Schema
- Tables: `workflows`, `runs`, `runners`, `github_settings`.
- `runs.status` uses the seven statuses from tech.md as a Postgres enum.
- `runs` keeps a graph snapshot, the ordered run events, and the approval
  decision with its time.
- Runner tokens are stored as a SHA-256 hash with a preview; the plain token
  is returned once and never stored (security.md 8).
- All timestamps are `timestamptz`.

## R3 Validation at the API boundary
- Every request body is parsed with a Zod schema from `packages/shared`.
- A saved graph must pass the shared structure rules and the per-node config
  schema. Invalid input returns 400 with readable messages.
- Unknown ids return 404. Database errors return 500 or 503 and are never
  reported as success.

## R4 Access
- `/api/*` requires the demo session cookie and returns 401 JSON otherwise.
  `/api/github/webhook` is excluded, because GitHub signs it with HMAC.

## R5 One editor
- The old editor (`/workflow/new`, `/workflow/[id]/edit`) is removed.
- `/workflow` and `/workflow/[id]/edit` redirect to `/workflows` and
  `/workflows/[id]`, so old links do not 404.

## R6 Seed
- `pnpm --filter web db:seed` writes the demo workflow (Spark -> Brain ->
  Scalpel | Heart -> Lightning Lever -> Autopsy Report), the two demo
  runners and the GitHub settings row. Running it again resets the demo
  workflow and does not duplicate rows.

## Out of scope
- Real runner execution and SSE. Runs still use the deterministic mock
  timeline, now computed and stored on the server.
- Real auth (product.md: simple demo account only).

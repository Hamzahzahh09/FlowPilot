# Tasks: neon-data-layer

After every task: `tsc --noEmit` in `apps/web`, root `pnpm lint`, fix, commit.

- [x] 1. Neon connection and migration scripts
  - `drizzle.config.ts` reads `.env.local`, uses the unpooled URL.
  - `db/migrate.ts`, `db:generate` fixed for drizzle-kit 0.20.
  - Requirements: R2
- [x] 2. Schema and shared request schemas
  - `runs`, `runners`, `github_settings`, `run_status` enum, timestamptz.
  - `packages/shared/src/api.ts`. Generate and apply migration.
  - Requirements: R2, R3
- [x] 3. Server modules and API routes
  - `server/*`, `app/api/**`, auth for `/api/*` in middleware.
  - Requirements: R3, R4
- [ ] 4. `apiSource` and data source switch
  - Requirements: R1
- [ ] 5. Seed
  - Requirements: R6
- [ ] 6. Remove the old editor, add redirects
  - Requirements: R5
- [ ] 7. End-to-end check against Neon
  - Create, save, simulate, approve and reject through the API.

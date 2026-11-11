# FlowPilot — Tech Steering

## Stack
- Monorepo with pnpm workspaces: `apps/web`, `packages/runner`, `packages/shared`.
- `apps/web`: Next.js (App Router), React, TypeScript strict. API via route handlers.
- Workflow editor: React Flow (`@xyflow/react`).
- Database: PostgreSQL (Neon or Supabase) with Drizzle ORM.
- Realtime logs: Server-Sent Events (SSE). Do not add WebSocket.
- Validation: Zod. All workflow, job, and tool-argument schemas live in `packages/shared`.
- Runner: Node.js package; sandbox mode runs commands in a Docker container.
- AI: a single provider with tool calling. Keep the provider behind one small interface.

## Conventions
- TypeScript strict, no `any` without a comment explaining why.
- One module per node type and one module per AI tool, registered through a registry (extensibility).
- Workflow engine is a pure state machine where possible, so it is easy to test.
- Every workflow run has an explicit status: queued, running, awaiting_approval, succeeded, failed, cancelled, timed_out.
- Tests: Vitest. Use property-based tests (fast-check) for the job validator and command allowlist.
- Small commits with clear messages; commit often so the history shows the Kiro-driven process.

## Out of scope
Auth providers beyond a simple demo account, billing, multi-tenant orgs, GitHub App marketplace flow (use webhook first).

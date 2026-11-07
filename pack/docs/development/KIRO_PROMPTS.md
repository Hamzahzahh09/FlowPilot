# Kiro prompts (copy-paste)

## 1. Scaffold
Set up a pnpm workspace monorepo following the steering files: apps/web (Next.js App Router, TypeScript strict), packages/shared (Zod schemas, empty index), packages/runner (Node.js TypeScript package, empty entry). Add Vitest, ESLint, Prettier, and root scripts: dev, build, lint, test. Do not add features yet.

## 2. Spec: workflow-builder
Create a spec for a visual workflow builder in apps/web using @xyflow/react. Node types: Spark, Brain, Eyes, Scalpel, Heart, Fork, Lightning Lever, Autopsy Report (see product steering). Requirements: add nodes from a palette, connect them with dashed "stitch" edges, edit each node's config in a side panel, save and load workflows. Workflows are stored in PostgreSQL as JSON validated by a shared Zod schema in packages/shared. Apply the dark Frankenstein-lab theme from the steering file. Out of scope: running workflows.

## 3. Spec: workflow-engine
Create a spec for a workflow engine that runs a saved workflow node by node as a state machine with the statuses defined in tech steering. Include timeouts, failure handling, a pause at the Lightning Lever node until approve/reject, and an event stream for realtime logs (SSE). Define a "Simulate push" input that starts a run from a fake push payload.

## 4. Spec: sandbox-runner
Create a spec for the runner package: it receives signed, Zod-validated jobs and runs only allowlisted commands (npm run lint, npm test) inside a Docker sandbox with time/CPU/memory limits and no network. Include property-based tests (fast-check) proving that any command outside the allowlist is never executed.

## 5. Spec: ai-agent-tools
Create a spec for an AI agent with tool calling and these tools: read_repo_tree, read_file, get_git_diff, run_lint, run_tests, write_report. Tool args validated with Zod, step cap per run, every call logged. The agent must not be able to call anything outside this registry.

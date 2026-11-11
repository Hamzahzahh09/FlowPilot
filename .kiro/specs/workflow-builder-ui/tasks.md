# Tasks: workflow-builder-ui

After every task: `tsc --noEmit` in `apps/web`, root `pnpm lint`, fix, commit.

- [ ] 1. Design tokens and fonts
  - Replace `app/globals.css` with dark and light tokens, base styles,
    focus ring, reduced-motion rule. Import React Flow `base.css`.
  - Load Inter and JetBrains Mono in `app/layout.tsx`.
  - Requirements: R1, R9
- [ ] 2. AppShell
  - TopBar (logo, name, TabPills, Simulate push, Reset), canvas card,
    LogPanel placeholder, Inspector placeholder. Responsive at 820px and 390px.
  - `app/page.tsx` renders the editor.
  - Requirements: R2, R9
- [ ] 3. FlowNode
  - Icon set, node types and status labels, FlowNode with handles, status
    ring and status text, focus ring.
  - Requirements: R3
- [ ] 4. Canvas and demo workflow
  - ReactFlow with dot Background, demo nodes and edges, hidden attribution.
  - Pause here for browser review.
  - Requirements: R4
- [ ] 5. Edge styles
  - StitchEdge with idle, active (animated dash) and done states.
  - Requirements: R5
- [ ] 6. Run store and mocked run
  - Typed store, event reducer, timed mock run with lint error and failing
    test, Simulate push and Reset wiring.
  - Requirements: R6
- [ ] 7. LogPanel and ApprovalBar
  - Requirements: R7
- [ ] 8. Inspector and ReportCard
  - Requirements: R8

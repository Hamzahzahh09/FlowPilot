# Tasks: app-pages

After every task: `tsc --noEmit` in `apps/web`, root `pnpm lint`, fix, commit.

- [x] 1. Route map, shared layout, auth guard
  - Data layer types, `DataSource`, mock source with seed, hooks.
  - Demo auth module, `middleware.ts`, `(app)` layout with AppTopBar,
    SideNav, UserMenu, PageHeader.
  - Requirements: R10, R11, R12, R13
- [x] 2. `/login`
  - Requirements: R2
- [x] 3. `/workflows`
  - Cards, Simulate push (run start stub until task 5), New workflow,
    empty state. Pause for browser review.
  - Requirements: R3
- [x] 4. `/workflows/[id]` editor
  - Fork node kind, NodePicker, connect/drag/delete, NodeInspector with
    shared Zod config validation, Save with `validateWorkflow`, Simulate
    push. `/editor` redirects; remove the old `/editor` shell components.
  - Requirements: R4
- [x] 5. `/runs/[id]` live view
  - StitchEdge states, run reducer and mock timeline, RunCanvas, LogPanel,
    ApprovalBar, status badge.
  - Requirements: R5, R14
- [x] 6. `/runs/[id]/report`
  - ReportCard for Approve and Reject. Pause for browser review.
  - Requirements: R6
- [x] 7. `/runners` and `/settings/github`
  - Requirements: R7, R8
- [x] 8. P2 placeholders `/runs`, `/templates`
  - Requirements: R9
- [x] 9. Responsive and accessibility pass
  - Requirements: R15, R16
- [ ] 10. Links
  - Landing buttons and header to `/login` or `/workflows`, logo links,
    nav, report back-links.
  - Requirements: R1

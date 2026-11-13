# Tasks: loading-feedback

After every task: `tsc --noEmit` in `apps/web`, root `pnpm lint`, fix, commit.

- [x] 1. Skeletons and route loading.tsx
  - Skeleton, page skeletons, four loading.tsx, use them for data loading.
  - Requirements: R1, R6
- [x] 2. Top progress bar
  - lib/navigation.ts, NavigationProgress, useNavigate in every router.push.
  - Requirements: R2, R6
- [x] 3. Pending buttons
  - Spinner, Button pending props, the five actions.
  - Requirements: R3, R6
- [x] 4. Slow and failed waits
  - useSlow, WaitNotice, retry in useQuery and useAction, slow navigation.
  - Requirements: R5, R6
- [x] 5. Login status and production login fix
  - Requirements: R4
- [ ] 6. Measure and fix production speed
  - Requirements: R7

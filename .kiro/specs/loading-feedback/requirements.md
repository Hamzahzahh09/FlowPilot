# Requirements: loading-feedback

Every wait in the app gets visible, accessible feedback, and page
transitions are fast in production. Next 14.2, no new dependencies, no
`useLinkStatus` (Next 15+).

## R1 Route skeletons
- `loading.tsx` for `/workflows`, `/workflows/[id]`, `/runs/[id]` and
  `/runs/[id]/report`, shaped like the page it stands in for.
- Blocks use `--node`, radius 16px (`--radius-node`), and a gentle opacity
  pulse. The same skeletons replace the "Loading..." text while the page
  loads its data, so the user sees one skeleton, not two loading states.

## R2 Top progress bar
- A 3px bar in `--accent` at the top of the viewport starts on the click of
  any internal link and on every programmatic navigation, and ends when the
  new route has rendered.
- Not shown for external links, new-tab clicks (modifier keys, `target`),
  downloads, or links to the current URL.

## R3 Pending buttons
- Login, Simulate push (card and editor), Save, Approve, Reject: while
  pending the button is disabled, has `aria-busy="true"`, shows a small
  spinner and a pending label: "Signing in…", "Starting run…", "Saving…",
  "Approving…", "Rejecting…".
- Approve and Reject keep equal size and weight while one is pending.

## R4 Login status
- After a valid submit a visible status line shows "Signing in as demo…",
  then "Loading your workspace…" until the app has loaded.
- The form never stays unchanged after submit: either an error or the
  status line is shown.

## R5 Slow and failed waits
- When a data load, action or navigation takes longer than 8 seconds, show
  "This is taking longer than usual. The database may be waking up." with a
  Retry button.
- When it fails, show a clear error with Retry.

## R6 Accessibility and motion
- Pending and slow messages are in `role="status"` with
  `aria-live="polite"`; errors use `role="alert"`.
- Under `prefers-reduced-motion: reduce` spinners become a static dot,
  skeleton pulses stop, and the progress bar does not animate.

## R7 Speed
- Measure click-to-render and click-to-content for the main transitions in
  `next dev` and in `pnpm build && pnpm start`, and fix what is slow in
  production.

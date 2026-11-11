# Tasks: landing-page

After every task: `tsc --noEmit` in `apps/web`, root `pnpm lint`, fix, commit.

- [ ] 1. Routes and layout
  - Move the editor to `/editor`; editor logo links to `/`.
  - `/` renders a landing skeleton: header, main, footer, 1120px container.
  - Add `lib/site.ts` and `ButtonLink`.
  - Requirements: Routes, R6.1, R6.3
- [ ] 2. Top bar and hero
  - LandingHeader, Hero copy and buttons, HeroCanvas (read-only Canvas,
    `stitch-active` edges, reduced-motion stop).
  - Pause here for browser review.
  - Requirements: R1, R2
- [ ] 3. How it works
  - Requirements: R3
- [ ] 4. Three-parts section and footer
  - Requirements: R4, R5
- [ ] 5. Responsive and accessibility pass
  - Check 1280px and 390px, single h1, focus rings, contrast in both themes.
  - Requirements: R6
